import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('fotoreg.db');

export const initializeDatabase = async () => {
  try {
    const queries = [
      // Tabla de Pacientes (Datos estables)
      `CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        documentNumber TEXT NOT NULL UNIQUE,
        dateOfBirth TEXT,
        occupation TEXT,
        createdAt TEXT NOT NULL
      );`,
      // Tabla de Consultas (Historial clínico)
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
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      );`,
      // Tabla de Borradores de Consulta
      `CREATE TABLE IF NOT EXISTS consultation_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        consultation_data TEXT, -- Almacenará un JSON con todos los datos del formulario
        last_updated TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      );`,
      // Tabla de Fotos
      `DROP TABLE IF EXISTS photos;`,
      `CREATE TABLE photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultation_id INTEGER NOT NULL,
        local_uri TEXT NOT NULL,
        stage TEXT NOT NULL CHECK(stage IN ('antes', 'despues', 'voucher')),
        taken_at TEXT NOT NULL
      );`,
    ];

    const dbInstance = await db;
    for (const query of queries) {
      await dbInstance.runAsync(query);
    }
    console.log('Base de datos simplificada inicializada correctamente.');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    throw error;
  }
};

