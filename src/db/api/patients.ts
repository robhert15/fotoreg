import { openDatabaseAsync } from 'expo-sqlite';
import { NewPatient, Patient, PatientWithLastDiagnosis } from '@/types';

const db = openDatabaseAsync('fotoreg.db');

/**
 * Añade un nuevo paciente a la base de datos.
 * @param patient El objeto del nuevo paciente.
 * @returns El ID del paciente recién creado.
 */
export const addPatient = async (patient: NewPatient): Promise<number> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  const result = await dbInstance.runAsync(
    `INSERT INTO patients (
      first_name, paternal_last_name, maternal_last_name, document_number, date_of_birth, 
      gender, address, occupation, whatsapp, contact_phone, physical_activity, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    patient.first_name,
    patient.paternal_last_name,
    patient.maternal_last_name || null,
    patient.document_number || null,
    patient.date_of_birth || null,
    patient.gender || null,
    patient.address || null,
    patient.occupation || null,
    patient.whatsapp || null,
    patient.contact_phone || null,
    patient.physical_activity || null,
    now
  );
  return result.lastInsertRowId;
};

/**
 * Busca pacientes por nombre, apellidos o número de documento.
 * @param searchTerm El término de búsqueda.
 * @returns Un array de pacientes que coinciden con la búsqueda.
 */
export const findPatients = async (searchTerm: string): Promise<Patient[]> => {
  const dbInstance = await db;
  const query = `
    SELECT * FROM patients
    WHERE first_name LIKE ? OR paternal_last_name LIKE ? OR maternal_last_name LIKE ? OR document_number LIKE ?
    ORDER BY paternal_last_name, maternal_last_name, first_name ASC;
  `;
  const likeTerm = `%${searchTerm}%`;
  const result = await dbInstance.getAllAsync<Patient>(
    query,
    likeTerm,
    likeTerm,
    likeTerm,
    likeTerm
  );
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
  const result = await dbInstance.getFirstAsync<Patient>(query, id);
  return result ?? null;
};

/**
 * Busca pacientes y, para cada uno, adjunta la fecha y diagnóstico de su última consulta.
 * Esta función está optimizada para evitar el problema N+1, usando una única consulta.
 * @param searchTerm El término de búsqueda.
 * @returns Un array de pacientes con su última información de consulta.
 */
export const findPatientsWithLastConsultation = async (searchTerm: string): Promise<PatientWithLastDiagnosis[]> => {
  const dbInstance = await db;
  const likeTerm = `%${searchTerm}%`;

  const query = `
    SELECT 
      p.*,
      (SELECT consultation_date 
       FROM consultations 
       WHERE patient_id = p.id 
       ORDER BY consultation_date DESC 
       LIMIT 1) as last_visit,
      (SELECT diagnosis 
       FROM consultations 
       WHERE patient_id = p.id 
       ORDER BY consultation_date DESC 
       LIMIT 1) as last_diagnosis
    FROM patients p
    WHERE 
      p.first_name LIKE ? OR 
      p.paternal_last_name LIKE ? OR 
      p.maternal_last_name LIKE ? OR 
      p.document_number LIKE ?
    ORDER BY p.paternal_last_name, p.maternal_last_name, p.first_name ASC;
  `;

  const result = await dbInstance.getAllAsync<PatientWithLastDiagnosis>(
    query,
    likeTerm,
    likeTerm,
    likeTerm,
    likeTerm
  );

  return result;
};

