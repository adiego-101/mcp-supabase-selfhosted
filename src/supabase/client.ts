import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getConfig } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Inicializa y retorna el cliente de Supabase (usando la Service Role Key para bypassing de RLS).
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getConfig();

  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias para utilizar las herramientas de Auth y Storage.',
    );
  }

  // Creamos el cliente usando la service role key.
  // IMPORTANTE: En el contexto de un MCP (que actúa como un super admin), es seguro
  // y necesario usar la service role key, pero el usuario debe estar consciente de esto.
  supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.error(' Cliente Supabase API inicializado.');
  return supabaseClient;
}
