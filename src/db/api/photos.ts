import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('fotoreg.db');

export type PhotoAnnotation = {
  photo_id: number;
  data: any; // JSON serializable (strokes, colors, width, etc.)
  updated_at: string;
};

export const getAnnotationForPhoto = async (photoId: number): Promise<PhotoAnnotation | null> => {
  const dbInstance = await db;
  const row = await dbInstance.getFirstAsync<any>('SELECT photo_id, data, updated_at FROM photo_annotations WHERE photo_id = ?', photoId);
  if (!row) return null;
  let parsed: any = null;
  try {
    parsed = row.data ? JSON.parse(row.data) : null;
  } catch (e) {
    parsed = null;
  }
  return { photo_id: row.photo_id, data: parsed, updated_at: row.updated_at };
};

export const saveAnnotationForPhoto = async (photoId: number, data: any): Promise<void> => {
  const dbInstance = await db;
  const now = new Date().toISOString();
  const dataJson = JSON.stringify(data ?? null);
  await dbInstance.runAsync(
    `INSERT INTO photo_annotations (photo_id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(photo_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    photoId, dataJson, now
  );
};

export const deleteAnnotationForPhoto = async (photoId: number): Promise<void> => {
  const dbInstance = await db;
  await dbInstance.runAsync('DELETE FROM photo_annotations WHERE photo_id = ?', photoId);
};
