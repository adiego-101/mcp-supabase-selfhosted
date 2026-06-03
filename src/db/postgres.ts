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
    max: 10, // Límite máximo de conexiones activas para este MCP
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 5000, // Abortar intentos de conexión lentos
    statement_timeout: 10000, // (10s) Abortar consultas pesadas/erróneas generadas por la IA
  });

  try {
    // Verificamos la conexión con una consulta sencilla
    const client = await pgPool.connect();
    client.release();
    console.error(' Conectado exitosamente a PostgreSQL (Pool con timeouts configurados).');
    return pgPool;
  } catch (error: unknown) {
    pgPool = null;
    const msg = error instanceof Error ? error.message : String(error);
    console.error(' Error conectando a PostgreSQL:', msg);
    throw error;
  }
}

/**
 * Ejecuta una query segura usando el pool.
 */
export async function query(sql: string, params: unknown[] = []) {
  const pool = await getDbPool();
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(' Error ejecutando query:', msg);
    throw error;
  }
}
