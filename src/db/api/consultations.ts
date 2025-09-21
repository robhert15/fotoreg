import { Consultation, ConsultationDraft, NewConsultation, Photo } from '@/types';
import { openDatabaseAsync } from 'expo-sqlite';

const db = openDatabaseAsync('fotoreg.db');

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

export const addPhoto = async (consultationId: number, uri: string, stage: 'antes' | 'despues'): Promise<void> => {
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

export const finalizeConsultation = async (draftId: number, patientId: number, consultationData: NewConsultation): Promise<number> => {
  try {
    const dbInstance = await db;
    const result = await dbInstance.runAsync(
      `INSERT INTO consultations (patient_id, consultation_date, reason, diagnosis, treatment, notes, medical_conditions, habits, shoe_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      patientId,
      consultationData.consultation_date ?? new Date().toISOString(),
      consultationData.reason ?? null,
      consultationData.diagnosis ?? null,
      consultationData.treatment ?? null,
      consultationData.notes ?? null,
      consultationData.medical_conditions ?? null,
      consultationData.habits ?? null,
      consultationData.shoe_type ?? null
    );
    const newConsultationId = result.lastInsertRowId;
    await dbInstance.runAsync(
      'UPDATE photos SET consultation_id = ? WHERE consultation_id = ?',
      newConsultationId,
      draftId
    );
    await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE id = ?', draftId);
    return newConsultationId;
  } catch (error) {
    console.error('Error in finalizeConsultation:', error);
    throw new Error('No se pudo guardar la consulta final.');
  }
};

/**
 * Obtiene todas las consultas de un paciente específico, ordenadas por fecha descendente.
 * @param patientId El ID del paciente.
 * @returns Un array con las consultas del paciente.
 */
export const getConsultationsForPatient = async (patientId: number): Promise<Consultation[]> => {
  try {
    const dbInstance = await db;
    const consultations = await dbInstance.getAllAsync<Consultation>(
      'SELECT * FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC',
      patientId
    );
    return consultations;
  } catch (error) {
    console.error('Error in getConsultationsForPatient:', error);
    throw new Error('No se pudo obtener el historial de consultas.');
  }
};

/**
 * Obtiene una consulta específica por su ID.
 * @param consultationId El ID de la consulta a buscar.
 * @returns El objeto de la consulta o null si no se encuentra.
 */
export const getConsultationById = async (consultationId: number): Promise<Consultation | null> => {
  try {
    const dbInstance = await db;
    const consultation = await dbInstance.getFirstAsync<Consultation>(
      'SELECT * FROM consultations WHERE id = ?',
      consultationId
    );
    return consultation || null;
  } catch (error) {
    console.error('Error in getConsultationById:', error);
    throw new Error('No se pudo obtener la consulta.');
  }
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
        consultationData.medical_conditions = [];
      }
    }
    if (typeof consultationData.habits === 'string') {
      try {
        consultationData.habits = JSON.parse(consultationData.habits);
      } catch {
        consultationData.habits = {};
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
export const updateConsultation = async (consultationId: number, data: NewConsultation): Promise<void> => {
  try {
    const dbInstance = await db;
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
      data.consultation_date ?? new Date().toISOString(),
      data.reason ?? null,
      data.diagnosis ?? null,
      data.treatment ?? null,
      data.notes ?? null,
      data.medical_conditions ?? null,
      data.habits ?? null,
      data.shoe_type ?? null,
      consultationId
    );
  } catch (error) {
    console.error('Error in updateConsultation:', error);
    throw new Error('No se pudo actualizar la consulta.');
  }
};

/**
 * Elimina un borrador de consulta por su ID.
 * @param draftId El ID del borrador a eliminar.
 */
export const deleteDraft = async (draftId: number): Promise<void> => {
  try {
    const dbInstance = await db;
    await dbInstance.runAsync('DELETE FROM consultation_drafts WHERE id = ?', draftId);
  } catch (error) {
    console.error('Error in deleteDraft:', error);
    throw new Error('No se pudo eliminar el borrador.');
  }
};