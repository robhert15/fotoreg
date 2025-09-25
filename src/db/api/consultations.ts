import { Consultation, ConsultationDraft, NewConsultation, Photo } from '@/types';
import { openDatabaseAsync } from 'expo-sqlite';

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

export const findOrCreateDraft = async (patientId: number): Promise<ConsultationDraft> => {
  try {
    const dbInstance = await db;
    let draft = await dbInstance.getFirstAsync<ConsultationDraft>(
      'SELECT * FROM consultation_drafts WHERE patient_id = ?',
      patientId
    );
    if (!draft) {
      const now = new Date().toISOString();
      const initialData = JSON.stringify({});
      const result = await dbInstance.runAsync(
        'INSERT INTO consultation_drafts (patient_id, consultation_data, last_updated) VALUES (?, ?, ?)',
        patientId,
        initialData,
        now
      );
      draft = {
        id: result.lastInsertRowId,
        patient_id: patientId,
        consultation_data: initialData,
        last_updated: now,
      };
    }
    return draft;
  } catch (error) {
    console.error('Error in findOrCreateDraft:', error);
    throw new Error('No se pudo encontrar o crear el borrador.');
  }
};

export const updateDraft = async (draftId: number, data: Partial<NewConsultation>): Promise<void> => {
  try {
    const dbInstance = await db;
    const dataAsJson = JSON.stringify(data);
    const now = new Date().toISOString();
    await dbInstance.runAsync(
      'UPDATE consultation_drafts SET consultation_data = ?, last_updated = ? WHERE id = ?',
      dataAsJson,
      now,
      draftId
    );
  } catch (error) {
    console.error('Error in updateDraft:', error);
    throw new Error('No se pudo actualizar el borrador.');
  }
};

export const addPhoto = async (consultationId: number, uri: string, stage: 'antes' | 'despues' | 'voucher'): Promise<void> => {
  try {
    const dbInstance = await db;
    const now = new Date().toISOString();
    await dbInstance.runAsync(
      'INSERT INTO photos (consultation_id, local_uri, stage, taken_at) VALUES (?, ?, ?, ?)',
      consultationId,
      uri,
      stage,
      now
    );
  } catch (error) {
    console.error('Error adding photo:', error);
    throw new Error('No se pudo guardar la foto.');
  }
};

export const getPhotosForConsultation = async (consultationId: number): Promise<Photo[]> => {
  try {
    const dbInstance = await db;
    const photos = await dbInstance.getAllAsync<Photo>(
      'SELECT * FROM photos WHERE consultation_id = ?',
      consultationId
    );
    return photos;
  } catch (error) {
    console.error('Error getting photos:', error);
    throw new Error('No se pudieron obtener las fotos.');
  }
};

/**
 * Elimina todas las fotos asociadas a una consulta o borrador específico.
 * Útil para limpiar un borrador cuando se inicia una nueva consulta.
 */
export const deletePhotosForConsultation = async (consultationId: number): Promise<void> => {
  try {
    const dbInstance = await db;
    await dbInstance.runAsync('DELETE FROM photos WHERE consultation_id = ?', consultationId);
  } catch (error) {
    console.error('Error deleting photos for consultation:', error);
    throw new Error('No se pudieron eliminar las fotos.');
  }
};

/**
 * Mueve todas las fotos asociadas a un borrador (draftId) a una consulta existente (consultationId).
 * Útil en el flujo de edición para preservar las fotos nuevas al guardar.
 */
export const moveDraftPhotosToConsultation = async (draftId: number, consultationId: number): Promise<void> => {
  try {
    const dbInstance = await db;
    await dbInstance.runAsync(
      'UPDATE photos SET consultation_id = ? WHERE consultation_id = ?',
      consultationId,
      draftId
    );
  } catch (error) {
    console.error('Error moving draft photos to consultation:', error);
    throw new Error('No se pudieron mover las fotos del borrador a la consulta.');
  }
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

/**
 * Obtiene todas las consultas de un paciente específico, ordenadas por fecha descendente.
 * @param patientId El ID del paciente.
 * @returns Un array con las consultas del paciente.
 */
export const getConsultationsForPatient = async (patientId: number): Promise<Consultation[]> => {
  const dbInstance = await db;
  const results = await dbInstance.getAllAsync<any>('SELECT * FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC', patientId);
  return results.map(deserializeConsultation).filter(c => c !== null) as Consultation[];
};

/**
 * Obtiene una consulta específica por su ID.
 * @param consultationId El ID de la consulta a buscar.
 * @returns El objeto de la consulta o null si no se encuentra.
 */
export const getConsultationById = async (consultationId: number): Promise<Consultation | null> => {
  const dbInstance = await db;
  const result = await dbInstance.getFirstAsync<any>('SELECT * FROM consultations WHERE id = ?', consultationId);
  return deserializeConsultation(result);
};

/**
 * Crea un nuevo borrador a partir de una consulta existente.
 * Elimina cualquier borrador antiguo para el mismo paciente para evitar conflictos.
 * @param patientId El ID del paciente.
 * @param consultationId El ID de la consulta a editar.
 * @returns El nuevo borrador creado.
 */
export const createDraftFromConsultation = async (patientId: number, consultationId: number): Promise<ConsultationDraft> => {
  try {
    const dbInstance = await db;

    // 1. Obtener los datos de la consulta original
    const originalConsultation = await getConsultationById(consultationId);
    if (!originalConsultation) {
      throw new Error('La consulta original no fue encontrada.');
    }

    // 2. Eliminar cualquier borrador antiguo para este paciente
    await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE patient_id = ?', patientId);

    // 3. Crear el nuevo borrador con los datos de la consulta
    const now = new Date().toISOString();
    // Excluimos 'id' y 'patient_id' ya que no son parte de los datos del formulario
    const { id, patient_id, ...consultationData } = originalConsultation;

    // DESENVOLVER EL JSON ANIDADO
    // Asegurarse de que los campos que son cadenas JSON se conviertan en objetos
    if (typeof consultationData.medical_conditions === 'string') {
      try {
        consultationData.medical_conditions = JSON.parse(consultationData.medical_conditions);
      } catch {
        // Si falla el parseo, se asigna un valor por defecto seguro
        (consultationData as any).medical_conditions = [] as any;
      }
    }
    if (typeof consultationData.habits === 'string') {
      try {
        consultationData.habits = JSON.parse(consultationData.habits);
      } catch {
        (consultationData as any).habits = {} as any;
      }
    }

    const dataAsJson = JSON.stringify(consultationData);

    const result = await dbInstance.runAsync(
      'INSERT INTO consultation_drafts (patient_id, consultation_data, last_updated) VALUES (?, ?, ?)',
      patientId,
      dataAsJson,
      now
    );

    const newDraftId = result.lastInsertRowId;
    return {
      id: newDraftId,
      patient_id: patientId,
      consultation_data: dataAsJson,
      last_updated: now,
    };

  } catch (error) {
    console.error('Error in createDraftFromConsultation:', error);
    throw new Error('No se pudo crear el borrador para edición.');
  }
};

/**
 * Actualiza una consulta existente en la base de datos.
 * @param consultationId El ID de la consulta a actualizar.
 * @param data El objeto con los nuevos datos para la consulta.
 */
export const getLastConsultationForPatient = async (patientId: number): Promise<Pick<Consultation, 'consultation_date' | 'diagnosis'> | null> => {
  const dbInstance = await db;
  const query = `
    SELECT consultation_date, diagnosis 
    FROM consultations 
    WHERE patient_id = ? 
    ORDER BY consultation_date DESC 
    LIMIT 1;
  `;
  const result = await dbInstance.getFirstAsync<Pick<Consultation, 'consultation_date' | 'diagnosis'>>(query, patientId);
  return result ? deserializeConsultation(result) : null;
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
export const deleteDraft = async (draftId: number): Promise<void> => {
  try {
    const dbInstance = await db;
    await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE id = ?', draftId);
  } catch (error) {
    console.error('Error in deleteDraft:', error);
    throw new Error('No se pudo eliminar el borrador.');
  }
};