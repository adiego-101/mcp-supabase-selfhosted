import { Pool } from 'pg';
import { getConfig } from '../config/env.js';

let pgPool: Pool | null = null;

/**
 * Inicializa y retorna el pool de conexiones de Postgres si DATABASE_URL está configurada.
 */
export async function getDbPool(): Promise<Pool> {
  if (pgPool) {
    return pgPool;
  }

  const config = getConfig();

  if (!config.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL no está configurada. Las herramientas de base de datos directa no funcionarán.',
    );
  }

  pgPool = new Pool({
    connectionString: config.DATABASE_URL,
    // Puedes habilitar ssl si tu entorno self-hosted lo requiere forzosamente
    // ssl: { rejectUnauthorized: false }
  });

  try {
    // Verificamos la conexión con una consulta sencilla
    const client = await pgPool.connect();
    client.release();
    console.error('✅ Conectado exitosamente a PostgreSQL (Pool).');
    return pgPool;
  } catch (error) {
    pgPool = null;
    console.error('❌ Error conectando a PostgreSQL:', error);
    throw error;
  }
}

/**
 * Ejecuta una query segura usando el pool.
 */
export async function query(sql: string, params: any[] = []) {
  const pool = await getDbPool();
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error: any) {
    console.error('❌ Error ejecutando query:', error.message);
    throw error;
  }
}
