import dotenv from 'dotenv';
import { z } from 'zod';

// Cargar variables de entorno del archivo .env si existe
dotenv.config();

// Esquema de validación para las variables de entorno
const envSchema = z
  .object({
    SUPABASE_URL: z.string().url('La URL de Supabase debe ser válida').optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    DATABASE_URL: z
      .string()
      .url('La URL de la base de datos (Postgres) debe ser válida')
      .optional(),
  })
  .refine(
    (data) => {
      // Al menos una de las dos formas de conexión debe estar configurada
      const hasSupabaseAPI = !!(data.SUPABASE_URL && data.SUPABASE_SERVICE_ROLE_KEY);
      const hasDBConnection = !!data.DATABASE_URL;
      return hasSupabaseAPI || hasDBConnection;
    },
    {
      message:
        'Debes configurar al menos DATABASE_URL o (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)',
    },
  );

export function getConfig() {
  try {
    const config = envSchema.parse(process.env);
    return config;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error(' Error de configuración. Faltan variables de entorno o son inválidas:');
      error.issues.forEach((e: z.ZodIssue) => console.error(`  - ${e.message}`));
      process.exit(1);
    }
    throw error;
  }
}
