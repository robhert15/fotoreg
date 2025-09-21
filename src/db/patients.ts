import { openDatabaseAsync, type SQLiteRunResult } from 'expo-sqlite';
import { NewPatient, Patient } from '@/types';

// Abre o crea la base de datos
const dbPromise = openDatabaseAsync('fotoreg.db');

// 1. Función de Inicialización de la Base de Datos
export const initDB = async (): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      lastName TEXT NOT NULL,
      documentNumber TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    );
  `);
};

// 2. Función para añadir un nuevo paciente
export const addPatient = async (patient: NewPatient): Promise<SQLiteRunResult> => {
  const db = await dbPromise;
  return await db.runAsync(
    'INSERT INTO patients (name, lastName, documentNumber, createdAt) VALUES (?, ?, ?, ?);',
    [patient.name, patient.lastName, patient.documentNumber, patient.createdAt]
  );
};

// 3. Función para buscar pacientes
export const findPatients = async (searchTerm: string): Promise<Patient[]> => {
  const db = await dbPromise;
  const query = `
    SELECT * FROM patients
    WHERE name LIKE ? OR lastName LIKE ? OR documentNumber LIKE ?
    ORDER BY lastName ASC;
  `;
  const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
  
  const result = await db.getAllAsync<Patient>(query, params);
  return result;
};
