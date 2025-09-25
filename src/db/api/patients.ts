import { openDatabaseAsync } from 'expo-sqlite';
import { NewPatient, Patient } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

// Helper: detect if a column exists in the 'patients' table (supports legacy DBs)
const patientsHasColumn = async (columnName: string): Promise<boolean> => {
  const dbInstance = await db;
  const rows = await dbInstance.getAllAsync<any>(`PRAGMA table_info(patients)`);
  return rows.some((r) => r.name === columnName);
};

/**
 * Añade un nuevo paciente a la base de datos usando el esquema V3.
 * @param patient El objeto del nuevo paciente con first_name y last_name.
 * @returns El ID del paciente recién creado.
 */
export const addPatient = async (patient: NewPatient): Promise<number> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  // If V3 columns exist, insert using the new schema; otherwise fall back to legacy V2 columns
  const hasFirstName = await patientsHasColumn('first_name');
  let result;
  if (hasFirstName) {
    result = await dbInstance.runAsync(
      'INSERT INTO patients (first_name, last_name, document_number, date_of_birth, occupation, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      patient.first_name,
      patient.last_name,
      patient.document_number || null,
      patient.date_of_birth || null,
      patient.occupation || null,
      now
    );
  } else {
    // Legacy schema: name, documentNumber, createdAt
    const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim();
    result = await dbInstance.runAsync(
      'INSERT INTO patients (name, documentNumber, createdAt) VALUES (?, ?, ?)',
      fullName,
      patient.document_number || null,
      now
    );
  }
  return result.lastInsertRowId;
};

/**
 * Busca pacientes por nombre, apellido o número de documento.
 * @param searchTerm El término de búsqueda.
 * @returns Un array de pacientes que coinciden con la búsqueda.
 */
export const findPatients = async (searchTerm: string): Promise<Patient[]> => {
  const dbInstance = await db;
  const hasFirstName = await patientsHasColumn('first_name');
  if (hasFirstName) {
    const query = `
      SELECT * FROM patients
      WHERE first_name LIKE ? OR last_name LIKE ? OR document_number LIKE ?
      ORDER BY last_name, first_name ASC;
    `;
    const result = await dbInstance.getAllAsync<Patient>(
      query,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
    return result;
  } else {
    // Legacy schema fallback: map/alias to V3 Patient shape
    const query = `
      SELECT 
        id,
        name AS first_name,
        '' AS last_name,
        documentNumber AS document_number,
        NULL AS date_of_birth,
        NULL AS occupation,
        createdAt AS created_at
      FROM patients
      WHERE name LIKE ? OR documentNumber LIKE ?
      ORDER BY name ASC;
    `;
    const result = await dbInstance.getAllAsync<Patient>(
      query,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
    return result;
  }
};

/**
 * Obtiene un paciente específico por su ID.
 * @param id El ID del paciente a buscar.
 * @returns El objeto del paciente o null si no se encuentra.
 */
export const getPatientById = async (id: number): Promise<Patient | null> => {
  const dbInstance = await db;
  const hasFirstName = await patientsHasColumn('first_name');
  if (hasFirstName) {
    const query = `SELECT * FROM patients WHERE id = ?;`;
    const result = await dbInstance.getFirstAsync<Patient>(query, id);
    return result ?? null;
  } else {
    // Legacy schema: alias fields to match V3 Patient
    const query = `
      SELECT 
        id,
        name AS first_name,
        '' AS last_name,
        documentNumber AS document_number,
        NULL AS date_of_birth,
        NULL AS occupation,
        createdAt AS created_at
      FROM patients WHERE id = ?;
    `;
    const result = await dbInstance.getFirstAsync<Patient>(query, id);
    return result ?? null;
  }
};

