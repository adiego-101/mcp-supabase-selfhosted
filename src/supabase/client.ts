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
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to use Auth and Storage tools.',
    );
  }

  // Create client using the service role key.
  // IMPORTANT: In an MCP context (acting as super admin), it is safe
  // and necessary to use the service role key, but the user should be aware of this.
  supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.error(' Supabase API client initialized.');
  return supabaseClient;
}
