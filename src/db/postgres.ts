import { Client } from 'pg';
import { getConfig } from '../config/env.js';

let pgClient: Client | null = null;

/**
 * Inicializa y retorna el cliente de Postgres si DATABASE_URL está configurada.
 */
export async function getDbClient(): Promise<Client> {
  if (pgClient) {
    return pgClient;
  }

  const config = getConfig();

  if (!config.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL no está configurada. Las herramientas de base de datos directa no funcionarán.',
    );
  }

  pgClient = new Client({
    connectionString: config.DATABASE_URL,
    // Puedes habilitar ssl si tu entorno self-hosted lo requiere forzosamente
    // ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    console.error('✅ Conectado exitosamente a PostgreSQL.');
    return pgClient;
  } catch (error) {
    pgClient = null;
    console.error('❌ Error conectando a PostgreSQL:', error);
    throw error;
  }
}

/**
 * Ejecuta una query segura usando prepared statements.
 */
export async function query(sql: string, params: any[] = []) {
  const client = await getDbClient();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } catch (error: any) {
    console.error('❌ Error ejecutando query:', error.message);
    throw error;
  }
}
