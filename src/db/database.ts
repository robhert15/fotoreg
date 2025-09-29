import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('fotoreg.db');

export const initializeDatabase = async () => {
  try {
    const dbInstance = await db;
    // Sentencia para habilitar llaves foráneas en SQLite
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    const queries = [
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
      // SOLUCIÓN: Se elimina DROP TABLE y se usa CREATE TABLE IF NOT EXISTS para no perder datos.
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

    for (const query of queries) {
      await dbInstance.runAsync(query);
    }

    if (__DEV__) {
      console.log('Base de datos V3 inicializada correctamente.');
    }
  } catch (error) {
    console.error('Error inicializando la base de datos V3:', error);
    throw error;
  }
};

