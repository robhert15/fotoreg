import { openDatabaseAsync } from 'expo-sqlite';
import { NewPatient, Patient, PatientWithLastDiagnosis } from '@/types';
import { normalizeText } from '@/utils/textUtils';

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
      gender, address, occupation, whatsapp, contact_phone, physical_activity, created_at, last_accessed_at,
      first_name_normalized, paternal_last_name_normalized, maternal_last_name_normalized
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    now,
    now,
    normalizeText(patient.first_name),
    normalizeText(patient.paternal_last_name),
    patient.maternal_last_name ? normalizeText(patient.maternal_last_name) : null
  );
  return result.lastInsertRowId;
};

/**
 * Actualiza la marca de tiempo de último acceso de un paciente.
 * @param patientId El ID del paciente a actualizar.
 */
export const updatePatientAccessTimestamp = async (patientId: number): Promise<void> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  await dbInstance.runAsync('UPDATE patients SET last_accessed_at = ? WHERE id = ?', now, patientId);
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
export const findPatientsWithLastConsultation = async (
  searchTerm: string,
  orderBy: 'recent' | 'asc' | 'desc' = 'recent'
): Promise<PatientWithLastDiagnosis[]> => {
  const dbInstance = await db;
  const normalizedSearchTerm = normalizeText(searchTerm);
  const likeTerm = `%${normalizedSearchTerm}%`;

  let orderByClause = '';
  switch (orderBy) {
    case 'asc':
      orderByClause = 'ORDER BY p.paternal_last_name ASC, p.maternal_last_name ASC, p.first_name ASC';
      break;
    case 'desc':
      orderByClause = 'ORDER BY p.paternal_last_name DESC, p.maternal_last_name DESC, p.first_name DESC';
      break;
    case 'recent':
    default:
      orderByClause = 'ORDER BY p.last_accessed_at DESC';
      break;
  }

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
      p.first_name_normalized LIKE ? OR 
      p.paternal_last_name_normalized LIKE ? OR 
      p.maternal_last_name_normalized LIKE ? OR 
      p.document_number LIKE ?
    ${orderByClause};
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

