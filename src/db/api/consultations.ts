import { openDatabaseAsync } from 'expo-sqlite';
import { Consultation, ConsultationDraft, NewConsultation, Photo } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

// --- Funciones Auxiliares de Serialización ---

const deserializeConsultation = (dbResult: any): Consultation | null => {
  if (!dbResult) return null;
  return {
    ...dbResult,
    medical_conditions: dbResult.medical_conditions ? JSON.parse(dbResult.medical_conditions) : [],
    habits: dbResult.habits ? JSON.parse(dbResult.habits) : {},
  };
};

const serializeConsultation = (data: Partial<NewConsultation>): any => {
  return {
    ...data,
    medical_conditions: JSON.stringify(data.medical_conditions || []),
    habits: JSON.stringify(data.habits || {}),
  };
};

// --- API de Consultas Refactorizada ---

export const getConsultationById = async (consultationId: number): Promise<Consultation | null> => {
  const dbInstance = await db;
  const result = await dbInstance.getFirstAsync<any>('SELECT * FROM consultations WHERE id = ?', consultationId);
  return deserializeConsultation(result);
};

export const getConsultationsForPatient = async (patientId: number): Promise<Consultation[]> => {
  const dbInstance = await db;
  const results = await dbInstance.getAllAsync<any>('SELECT * FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC', patientId);
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
    dataToStore.medical_conditions,
    dataToStore.habits,
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
  const result = await dbInstance.getFirstAsync<any>(query, patientId);
  // No necesita deserialización completa porque los campos seleccionados no son JSON
  return result ?? null;
};