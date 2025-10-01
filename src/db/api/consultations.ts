import { openDatabaseAsync } from 'expo-sqlite';
import { Consultation, ConsultationDraft, NewConsultation, Photo, Patient } from '@/types';
import { logger } from '@/utils/logger';

const db = openDatabaseAsync('fotoreg.db');

// --- Funciones Auxiliares de Serialización ---
// Control de logs para parseos inválidos (silenciado por defecto)
const LOG_PARSE_WARNINGS = false;
let WARNED_MC_ONCE = false;
let WARNED_HB_ONCE = false;

// Define a type for the raw database row to avoid 'any'
type ConsultationRow = Omit<Consultation, 'medical_conditions' | 'habits'> & {
  medical_conditions: string | null;
  habits: string | null;
};

const deserializeConsultation = (dbResult: ConsultationRow | null): Consultation | null => {
  if (!dbResult) return null;

  // medical_conditions: tolerate legacy/plain values and parsing errors
  let medicalConditions: Consultation['medical_conditions'] = [];
  const mc = dbResult.medical_conditions;
  if (mc == null || mc === '') {
    medicalConditions = [];
  } else if (Array.isArray(mc) || typeof mc === 'object') {
    medicalConditions = mc;
  } else {
    try {
      medicalConditions = JSON.parse(mc);
    } catch (e) {
      if (__DEV__ && LOG_PARSE_WARNINGS && !WARNED_MC_ONCE) {
        logger.warn('deserializeConsultation medical_conditions parse failed', { error: String(e) });
        WARNED_MC_ONCE = true;
      }
      medicalConditions = [];
    }
  }

  // habits: tolerate legacy/plain values and parsing errors
  let habitsObj: Consultation['habits'] = {};
  const hb = dbResult.habits;
  if (hb == null || hb === '') {
    habitsObj = {};
  } else if (typeof hb === 'object') {
    habitsObj = hb;
  } else {
    try {
      habitsObj = JSON.parse(hb);
    } catch (e) {
      if (__DEV__ && LOG_PARSE_WARNINGS && !WARNED_HB_ONCE) {
        logger.warn('deserializeConsultation habits parse failed', { error: String(e) });
        WARNED_HB_ONCE = true;
      }
      habitsObj = {};
    }
  }

  return {
    ...dbResult,
    medical_conditions: medicalConditions,
    habits: habitsObj,
  } as Consultation;
};

const serializeConsultation = (data: Partial<NewConsultation>): Partial<ConsultationRow> => {
  return {
    ...data,
    medical_conditions: JSON.stringify(data.medical_conditions || []),
    habits: JSON.stringify(data.habits || {}),
  };
};

// --- Helper: detectar columnas de patients para compatibilidad V2/V3 ---
const patientsHasColumn = async (columnName: string): Promise<boolean> => {
  const dbInstance = await db;
  const rows = await dbInstance.getAllAsync<{ name: string }>(`PRAGMA table_info(patients)`);
  return rows.some((r) => r.name === columnName);
};

// --- API de Consultas Refactorizada ---

export const getConsultationById = async (consultationId: number): Promise<Consultation | null> => {
  const dbInstance = await db;
  const result = await dbInstance.getFirstAsync<ConsultationRow>('SELECT * FROM consultations WHERE id = ?', consultationId);
  return deserializeConsultation(result);
};

export const getConsultationsForPatient = async (patientId: number): Promise<Consultation[]> => {
  const dbInstance = await db;
  try {
    const patientRow = await dbInstance.getFirstAsync<Patient>('SELECT * FROM patients WHERE id = ?', patientId);
    if (patientRow) {
      const doc = patientRow.document_number ?? null;
      if (doc) {
        const hasV3 = await patientsHasColumn('document_number');
        const results = await dbInstance.getAllAsync<ConsultationRow>(
          hasV3
            ? `SELECT c.* FROM consultations c WHERE c.patient_id IN (SELECT id FROM patients WHERE document_number = ?) ORDER BY c.consultation_date DESC`
            : `SELECT c.* FROM consultations c WHERE c.patient_id IN (SELECT id FROM patients WHERE documentNumber = ?) ORDER BY c.consultation_date DESC`,
          doc
        );
        return results.map(deserializeConsultation).filter(c => c !== null) as Consultation[];
      }
    }
  } catch (e) {
    logger.warn('getConsultationsForPatient document join failed, using direct id lookup', { error: String(e) });
  }

  // Fallback to direct lookup by id
  const results = await dbInstance.getAllAsync<ConsultationRow>(
    'SELECT * FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC',
    patientId
  );
  return results.map(deserializeConsultation).filter(c => c !== null) as Consultation[];
};

export const finalizeConsultation = async (draftId: number, patientId: number, consultationData: Partial<NewConsultation>): Promise<number> => {
  const dbInstance = await db;
  const dataToStore = serializeConsultation(consultationData);

  const result = await dbInstance.runAsync(
    `INSERT INTO consultations (patient_id, consultation_date, reason, diagnosis, treatment, notes, medical_conditions, habits, shoe_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    patientId,
    dataToStore.consultation_date ?? new Date().toISOString(),
    dataToStore.reason ?? null,
    dataToStore.diagnosis ?? null,
    dataToStore.treatment ?? null,
    dataToStore.notes ?? null,
    dataToStore.medical_conditions,
    dataToStore.habits,
    dataToStore.shoe_type ?? null
  );
  const newConsultationId = result.lastInsertRowId;

  // Mover fotos y limpiar borrador
  await dbInstance.runAsync('UPDATE photos SET consultation_id = ? WHERE consultation_id = ?', newConsultationId, draftId);
  await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE id = ?', draftId);

  return newConsultationId;
};

export const updateConsultation = async (consultationId: number, data: Partial<NewConsultation>): Promise<void> => {
  const dbInstance = await db;
  const dataToStore = serializeConsultation(data);

  await dbInstance.runAsync(
    `UPDATE consultations SET
      consultation_date = ?,
      reason = ?,
      diagnosis = ?,
      treatment = ?,
      notes = ?,
      medical_conditions = ?,
      habits = ?,
      shoe_type = ?
    WHERE id = ?`,
    dataToStore.consultation_date ?? new Date().toISOString(),
    dataToStore.reason ?? null,
    dataToStore.diagnosis ?? null,
    dataToStore.treatment ?? null,
    dataToStore.notes ?? null,
    dataToStore.medical_conditions ?? JSON.stringify([]),
    dataToStore.habits ?? JSON.stringify({}),
    dataToStore.shoe_type ?? null,
    consultationId
  );
};

// --- Lógica de Borradores (Drafts) ---

export const findOrCreateDraft = async (patientId: number): Promise<ConsultationDraft> => {
  const dbInstance = await db;
  let draft = await dbInstance.getFirstAsync<ConsultationDraft>('SELECT * FROM consultation_drafts WHERE patient_id = ?', patientId);
  if (!draft) {
    const now = new Date().toISOString();
    const initialData = JSON.stringify({});
    const result = await dbInstance.runAsync(
      'INSERT INTO consultation_drafts (patient_id, consultation_data, last_updated) VALUES (?, ?, ?)',
      patientId, initialData, now
    );
    draft = { id: result.lastInsertRowId, patient_id: patientId, consultation_data: initialData, last_updated: now };
  }
  return draft;
};

export const updateDraft = async (draftId: number, data: Partial<NewConsultation>): Promise<void> => {
  const dbInstance = await db;
  const dataAsJson = JSON.stringify(data);
  const now = new Date().toISOString();
  await dbInstance.runAsync('UPDATE consultation_drafts SET consultation_data = ?, last_updated = ? WHERE id = ?', dataAsJson, now, draftId);
};

export const createDraftFromConsultation = async (patientId: number, consultationId: number): Promise<ConsultationDraft> => {
  const dbInstance = await db;

  // 1) Obtener consulta original (ya deserializada por getConsultationById)
  const original = await getConsultationById(consultationId);
  if (!original) {
    throw new Error('La consulta original no fue encontrada.');
  }

  // 2) Limpiar borradores antiguos del paciente
  await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE patient_id = ?', patientId);

  // 3) Construir payload serializable sin ids y con fallbacks seguros
  const { id: _ignoredId, patient_id: _ignoredPid, ...rest } = original;
  const mc = Array.isArray(rest.medical_conditions) ? rest.medical_conditions : [];
  const hb = typeof rest.habits === 'object' && rest.habits !== null ? rest.habits : {};
  const dataAsJson = JSON.stringify({ ...rest, medical_conditions: mc, habits: hb });
  const now = new Date().toISOString();

  const result = await dbInstance.runAsync(
    'INSERT INTO consultation_drafts (patient_id, consultation_data, last_updated) VALUES (?, ?, ?)',
    patientId,
    dataAsJson,
    now
  );

  return {
    id: result.lastInsertRowId,
    patient_id: patientId,
    consultation_data: dataAsJson,
    last_updated: now,
  };
};

export const deleteDraft = async (draftId: number): Promise<void> => {
  const dbInstance = await db;
  await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE id = ?', draftId);
};

// --- Lógica de Fotos ---

export const addPhoto = async (consultationId: number, uri: string, stage: 'antes' | 'despues' | 'voucher'): Promise<void> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  await dbInstance.runAsync('INSERT INTO photos (consultation_id, local_uri, stage, taken_at) VALUES (?, ?, ?, ?)', consultationId, uri, stage, now);
};

export const getPhotosForConsultation = async (consultationId: number): Promise<Photo[]> => {
  const dbInstance = await db;
  return await dbInstance.getAllAsync<Photo>('SELECT * FROM photos WHERE consultation_id = ?', consultationId);
};

export const deletePhotosForConsultation = async (consultationId: number): Promise<void> => {
  const dbInstance = await db;
  await dbInstance.runAsync('DELETE FROM photos WHERE consultation_id = ?', consultationId);
};

export const moveDraftPhotosToConsultation = async (draftId: number, consultationId: number): Promise<void> => {
    const dbInstance = await db;
    await dbInstance.runAsync(
      'UPDATE photos SET consultation_id = ? WHERE consultation_id = ?',
      consultationId,
      draftId
    );
};

// --- Otras Funciones ---

export const getLastConsultationForPatient = async (patientId: number): Promise<Pick<Consultation, 'consultation_date' | 'diagnosis'> | null> => {
  const dbInstance = await db;
  const query = `SELECT consultation_date, diagnosis FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC LIMIT 1;`;
  const result = await dbInstance.getFirstAsync<Pick<Consultation, 'consultation_date' | 'diagnosis'>>(query, patientId);
  // No necesita deserialización completa porque los campos seleccionados no son JSON
  return result ?? null;
};