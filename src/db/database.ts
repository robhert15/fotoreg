import * as SQLite from 'expo-sqlite';
import { logger } from '@/utils/logger';
import { normalizeText } from '@/utils/textUtils';

const db = SQLite.openDatabaseAsync('fotoreg.db');

export const initializeDatabase = async () => {
  try {
    const dbInstance = await db;
    // Sentencia para habilitar llaves foráneas en SQLite
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    const schemaQueries = [
      // --- Schema V3: Pacientes y Responsables ---
      `CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        paternal_last_name TEXT NOT NULL,
        maternal_last_name TEXT,
        document_number TEXT UNIQUE,
        date_of_birth TEXT,
        gender TEXT,
        address TEXT,
        occupation TEXT,
        whatsapp TEXT,
        contact_phone TEXT,
        physical_activity TEXT,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS guardians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        document_number TEXT UNIQUE,
        relationship TEXT,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS patient_guardians (
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        guardian_id INTEGER NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
        PRIMARY KEY (patient_id, guardian_id)
      );`,

      // --- Tablas existentes (mantenidas) ---
      `CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        consultation_date TEXT NOT NULL,
        reason TEXT,
        diagnosis TEXT,
        treatment TEXT,
        notes TEXT,
        medical_conditions TEXT,
        habits TEXT,
        shoe_type TEXT,
        is_draft INTEGER NOT NULL DEFAULT 0, -- Columna de migración anterior
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS consultation_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        consultation_data TEXT, -- Almacenará un JSON con todos los datos del formulario
        last_updated TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultation_id INTEGER NOT NULL, -- Puede referirse a 'consultations' o 'consultation_drafts'
        local_uri TEXT NOT NULL,
        stage TEXT NOT NULL CHECK(stage IN ('antes', 'despues', 'voucher')),
        taken_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS photo_annotations (
        photo_id INTEGER PRIMARY KEY REFERENCES photos(id) ON DELETE CASCADE,
        data TEXT, -- JSON con trazos/colores/etc.
        updated_at TEXT NOT NULL
      );`,
    ];

    for (const query of schemaQueries) {
      await dbInstance.runAsync(query);
    }

    // --- Migraciones --- 
    // --- Migraciones de columnas ---
    const columnMigrations = [
      { column: 'last_accessed_at', type: 'TEXT' },
      { column: 'first_name_normalized', type: 'TEXT' },
      { column: 'paternal_last_name_normalized', type: 'TEXT' },
      { column: 'maternal_last_name_normalized', type: 'TEXT' },
    ];

    for (const { column, type } of columnMigrations) {
      try {
        await dbInstance.execAsync(`ALTER TABLE patients ADD COLUMN ${column} ${type};`);
        if (__DEV__) {
          logger.info(`Columna '${column}' añadida a la tabla 'patients'.`);
        }
      } catch (error: any) {
        if (!error.message.includes('duplicate column name')) {
          logger.error(`Error al añadir la columna '${column}'`, error);
        }
      }
    }

    // --- Creación de Índices ---
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations(patient_id, consultation_date);`,
      `CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(paternal_last_name, maternal_last_name, first_name);`,
      `CREATE INDEX IF NOT EXISTS idx_patients_document_number ON patients(document_number);`,
      `CREATE INDEX IF NOT EXISTS idx_photos_consultation ON photos(consultation_id);`,
      `CREATE INDEX IF NOT EXISTS idx_patients_last_accessed ON patients(last_accessed_at);`,
      `CREATE INDEX IF NOT EXISTS idx_patients_normalized_name ON patients(paternal_last_name_normalized, maternal_last_name_normalized, first_name_normalized);`,
    ];

    for (const query of indexQueries) {
      await dbInstance.runAsync(query);
    }

    // Migración de datos para normalizar texto de pacientes existentes
    const unmigratedPatients = await dbInstance.getAllAsync<{ id: number, first_name: string, paternal_last_name: string, maternal_last_name: string | null }>(
      'SELECT id, first_name, paternal_last_name, maternal_last_name FROM patients WHERE first_name_normalized IS NULL'
    );

    if (unmigratedPatients.length > 0) {
      if (__DEV__) {
        logger.info(`Migrando ${unmigratedPatients.length} pacientes para normalización de texto...`);
      }
      for (const p of unmigratedPatients) {
        await dbInstance.runAsync(
          'UPDATE patients SET first_name_normalized = ?, paternal_last_name_normalized = ?, maternal_last_name_normalized = ? WHERE id = ?',
          normalizeText(p.first_name),
          normalizeText(p.paternal_last_name),
          p.maternal_last_name ? normalizeText(p.maternal_last_name) : null,
          p.id
        );
      }
    }

    if (__DEV__) {
      logger.info('Base de datos V3 inicializada correctamente.');
    }
  } catch (error) {
    logger.error('Error inicializando la base de datos V3', error as Error);
    throw error;
  }
};

