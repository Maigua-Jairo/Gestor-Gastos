// src/database/database.ts
import { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'gastos.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  // Creamos la tabla base si no existe (v1)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT
    );
  `);

  // Verificamos la versión actual de la base de datos
  const result = await db.getFirstAsync<{ user_version: number }>(`PRAGMA user_version;`);
  const currentVersion = result?.user_version ?? 0;

  // Migración a Versión 2: Agregar columna receipt_uri si no existe
  if (currentVersion < 2) {
    try {
      await db.execAsync(`ALTER TABLE expenses ADD COLUMN receipt_uri TEXT;`);
    } catch (e) {
      // Si la columna ya existiera por alguna razón, evitamos que rompa
      console.log('La columna receipt_uri ya existe o fue agregada.', e);
    }
    // Actualizamos la versión de la base de datos
    await db.execAsync(`PRAGMA user_version = 2;`);
  }
}
