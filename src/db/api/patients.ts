import { openDatabaseAsync } from 'expo-sqlite';
import { NewPatient, Patient } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

/**
 * Añade un nuevo paciente a la base de datos usando el esquema V3.
 * @param patient El objeto del nuevo paciente con first_name y last_name.
 * @returns El ID del paciente recién creado.
 */
export const addPatient = async (patient: NewPatient): Promise<number> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  const result = await dbInstance.runAsync(
    'INSERT INTO patients (first_name, last_name, document_number, date_of_birth, occupation, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    patient.first_name,
    patient.last_name,
    patient.document_number || null,
    patient.date_of_birth || null,
    patient.occupation || null,
    now
  );
  return result.lastInsertRowId;
};

/**
 * Busca pacientes por nombre, apellido o número de documento.
 * @param searchTerm El término de búsqueda.
 * @returns Un array de pacientes que coinciden con la búsqueda.
 */
export const findPatients = async (searchTerm: string): Promise<Patient[]> => {
  const dbInstance = await db;
  const query = `
    SELECT * FROM patients
    WHERE first_name LIKE ? OR last_name LIKE ? OR document_number LIKE ?
    ORDER BY last_name, first_name ASC;
  `;
  const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
  
  const result = await dbInstance.getAllAsync<Patient>(query, params);
  return result;
};

/**
 * Obtiene un paciente específico por su ID.
 * @param id El ID del paciente a buscar.
 * @returns El objeto del paciente o null si no se encuentra.
 */
export const getPatientById = async (id: number): Promise<Patient | null> => {
  const dbInstance = await db;
  const query = `SELECT * FROM patients WHERE id = ?;`;
  const result = await dbInstance.getFirstAsync<Patient>(query, [id]);
  return result ?? null;
};

