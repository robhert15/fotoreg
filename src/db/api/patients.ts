import { openDatabaseAsync, type SQLiteRunResult } from 'expo-sqlite';
import { NewPatient, Patient } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

export const addPatient = async (patient: NewPatient): Promise<SQLiteRunResult> => {
  const dbInstance = await db;
  return await dbInstance.runAsync(
    'INSERT INTO patients (name, documentNumber, createdAt) VALUES (?, ?, ?);',
    [patient.name, patient.documentNumber, patient.createdAt]
  );
};

export const findPatients = async (searchTerm: string): Promise<Patient[]> => {
  const dbInstance = await db;
        const query = `
    SELECT * FROM patients
    WHERE name LIKE ? OR documentNumber LIKE ?
    ORDER BY name ASC;
  `;
  const params = [`%${searchTerm}%`, `%${searchTerm}%`];
  
      const result = await dbInstance.getAllAsync<Patient>(query, params);
  return result;
};

export const getPatientById = async (id: number): Promise<Patient | null> => {
  const dbInstance = await db;
  const query = `SELECT * FROM patients WHERE id = ?;`;
  const result = await dbInstance.getFirstAsync<Patient>(query, [id]);
  return result ?? null;
};
