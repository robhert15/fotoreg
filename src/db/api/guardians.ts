import { openDatabaseAsync } from 'expo-sqlite';
import { Guardian, NewGuardian } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

/**
 * Añade un nuevo responsable a la base de datos.
 * @param guardian El objeto con los datos del nuevo responsable.
 * @returns El ID del responsable recién creado.
 */
export const addGuardian = async (guardian: NewGuardian): Promise<number> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  const result = await dbInstance.runAsync(
    'INSERT INTO guardians (first_name, last_name, document_number, relationship, created_at) VALUES (?, ?, ?, ?, ?)',
    guardian.first_name,
    guardian.last_name,
    guardian.document_number || null,
    guardian.relationship || null,
    now
  );
  return result.lastInsertRowId;
};

/**
 * Asocia un responsable a un paciente.
 * @param patientId El ID del paciente.
 * @param guardianId El ID del responsable.
 */
export const linkGuardianToPatient = async (patientId: number, guardianId: number): Promise<void> => {
  const dbInstance = await db;
  await dbInstance.runAsync(
    'INSERT OR IGNORE INTO patient_guardians (patient_id, guardian_id) VALUES (?, ?)',
    patientId,
    guardianId
  );
};

/**
 * Obtiene todos los responsables asociados a un paciente.
 * @param patientId El ID del paciente.
 * @returns Un array con los responsables del paciente.
 */
export const getGuardiansForPatient = async (patientId: number): Promise<Guardian[]> => {
  const dbInstance = await db;
  const guardians = await dbInstance.getAllAsync<Guardian>(
    `SELECT g.* FROM guardians g
     JOIN patient_guardians pg ON g.id = pg.guardian_id
     WHERE pg.patient_id = ?`,
    patientId
  );
  return guardians;
};
