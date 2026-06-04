import { query } from '../db/postgres.js';
import { getSupabaseClient } from '../supabase/client.js';

export const toolsDefinitions = [
  {
    name: 'list_tables',
    description: 'List all tables in a specific PostgreSQL database schema.',
    inputSchema: {
      type: 'object',
      properties: {
        schema: {
          type: 'string',
          description: "The name of the schema (e.g. 'public', 'auth'). Defaults to 'public'.",
        },
      },
    },
  },
  {
    name: 'execute_sql',
    description:
      'Execute a raw SQL query on the Supabase PostgreSQL database. Useful for reading data, modifying schemas, or managing the database. WARNING: This tool has direct access, bypassing RLS.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'The SQL query to execute.',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_users',
    description:
      'List users registered in the Supabase Authentication service (auth.users). Returns basic user information.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'The page number for pagination (defaults to 1).',
        },
        perPage: {
          type: 'number',
          description: 'The amount of users per page (defaults to 50).',
        },
      },
    },
  },
  {
    name: 'create_user',
    description:
      'Create a new user in Supabase Auth. Useful for initializing administrative or test accounts.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email address.' },
        password: { type: 'string', description: 'User password (minimum 6 characters).' },
        email_confirm: {
          type: 'boolean',
          description: 'If true, auto-confirms the email (defaults to true).',
        },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'delete_user',
    description: 'Delete a Supabase Auth user by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'The UUID of the user to delete.' },
        confirm: {
          type: 'boolean',
          description: 'Must be true to confirm the destructive deletion.',
        },
      },
      required: ['user_id', 'confirm'],
    },
  },
  {
    name: 'list_buckets',
    description: 'List all storage buckets configured in the Supabase project.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_bucket',
    description: 'Create a new storage bucket in Supabase.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Name of the new bucket.' },
        public: {
          type: 'boolean',
          description: 'Whether the bucket should be public (defaults to false).',
        },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'delete_bucket',
    description: 'Delete a storage bucket in Supabase. The bucket must be empty or it will fail.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Name of the bucket to delete.' },
        confirm: {
          type: 'boolean',
          description: 'Must be true to confirm the destructive deletion.',
        },
      },
      required: ['bucket', 'confirm'],
    },
  },
  {
    name: 'get_schema',
    description:
      'Retrieve the database schema or a specific table structure. Useful for understanding columns before executing SQL.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description:
            'Table name to get columns for. If omitted, returns all tables with their columns.',
        },
        schema: {
          type: 'string',
          description: "The name of the schema (e.g. 'public'). Defaults to 'public'.",
        },
      },
    },
  },
  {
    name: 'get_advisors',
    description:
      'Get performance and security alerts/recommendations directly from the database (similar to Supabase dashboard alerts). Analyzes unused indexes, missing RLS policies, and cache hit ratio.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_files',
    description: 'List files and folders within a specific storage bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          description: 'The name of the bucket to query.',
        },
        path: {
          type: 'string',
          description: 'The folder path within the bucket (optional).',
        },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'list_rls_policies',
    description:
      'List all Row Level Security (RLS) policies active in the database. Useful for auditing access rules.',
    inputSchema: {
      type: 'object',
      properties: {
        schema: {
          type: 'string',
          description: "The schema to audit. Defaults to 'public'.",
        },
      },
    },
  },
  {
    name: 'get_active_connections',
    description:
      'Show current active database connections and their running queries. Excellent for debugging performance issues, locks, or connection pool saturation.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleGetSchema(params: any) {
  const schema = params?.schema || 'public';
  const tableName = params?.table_name;

  let sql = `
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = $1
  `;
  const queryParams = [schema];

  if (tableName) {
    sql += ` AND table_name = $2`;
    queryParams.push(tableName);
  }

  sql += ` ORDER BY table_name, ordinal_position;`;

  try {
    const rows = await query(sql, queryParams);
    return {
      content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error retrieving schema: ${error.message}` }],
    };
  }
}

export async function handleListTables(params: any) {
  const schema = params?.schema || 'public';
  const sql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = $1 AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  try {
    const rows = await query(sql, [schema]);
    return {
      content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error listing tables: ${error.message}` }],
    };
  }
}

export async function handleExecuteSql(params: any) {
  const { sql } = params;
  if (!sql) {
    return {
      isError: true,
      content: [{ type: 'text', text: "The 'sql' parameter is required." }],
    };
  }

  try {
    const rows = await query(sql);
    return {
      content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing SQL: ${error.message}` }],
    };
  }
}

export async function handleListUsers(params: any) {
  const supabase = getSupabaseClient();
  const page = params?.page || 1;
  const perPage = params?.perPage || 50;

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error listing users: ${error.message}` }],
    };
  }
}

export async function handleCreateUser(params: any) {
  const supabase = getSupabaseClient();
  const { email, password, email_confirm = true } = params;

  if (!email || !password) {
    return {
      isError: true,
      content: [{ type: 'text', text: "Both 'email' and 'password' parameters are required." }],
    };
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm,
    });

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error creating user: ${error.message}` }],
    };
  }
}

export async function handleDeleteUser(params: any) {
  const supabase = getSupabaseClient();
  const { user_id } = params;

  if (!user_id) {
    return {
      isError: true,
      content: [{ type: 'text', text: "El parámetro 'user_id' es obligatorio." }],
    };
  }

  try {
    const { data, error } = await supabase.auth.admin.deleteUser(user_id);

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error deleting user: ${error.message}` }],
    };
  }
}

export async function handleListBuckets() {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error listing buckets: ${error.message}` }],
    };
  }
}

export async function handleCreateBucket(params: any) {
  const supabase = getSupabaseClient();
  const { bucket, public: isPublic = false } = params;

  if (!bucket) {
    return {
      isError: true,
      content: [{ type: 'text', text: "The 'bucket' parameter is required." }],
    };
  }

  try {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: isPublic,
    });

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error creating bucket: ${error.message}` }],
    };
  }
}

export async function handleDeleteBucket(params: any) {
  const supabase = getSupabaseClient();
  const { bucket, confirm } = params || {};

  if (!bucket || confirm !== true) {
    return {
      isError: true,
      content: [
        { type: 'text', text: "The 'bucket' parameter is required and 'confirm' must be true." },
      ],
    };
  }

  try {
    const { data, error } = await supabase.storage.deleteBucket(bucket);

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error deleting bucket: ${error.message}` }],
    };
  }
}

export async function handleGetAdvisors() {
  try {
    // 1. Verificar tablas sin RLS (Seguridad)
    const rlsSql = `
      SELECT relname as table_name
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE nspname = 'public' AND relkind = 'r' AND relrowsecurity = false;
    `;
    const rlsRows = await query(rlsSql);

    // 2. Verificar índices no utilizados (Rendimiento)
    const indexesSql = `
      SELECT schemaname, relname as table_name, indexrelname as index_name, idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0 AND schemaname = 'public';
    `;
    const unusedIndexesRows = await query(indexesSql);

    // 3. Ratio de Caché (Salud General)
    const cacheSql = `
      SELECT 
        sum(blks_hit)*100/sum(blks_hit+blks_read) as cache_hit_ratio
      FROM pg_stat_database;
    `;
    const cacheRows = await query(cacheSql);

    const report = {
      security: {
        issue: 'Tables without Row Level Security (RLS) enabled',
        description: 'These tables are exposed to the anonymous API if RLS is not configured.',
        tables_affected: rlsRows.map((r: any) => r.table_name),
      },
      performance: {
        unused_indexes: {
          issue: 'Unused indexes',
          description:
            'Indexes that occupy space and slow down writes but are not being used in reads.',
          indexes: unusedIndexesRows,
        },
        cache_health: {
          issue: 'Cache hit ratio',
          description: 'Should be as close to 99% as possible.',
          ratio_percentage: cacheRows[0]?.cache_hit_ratio || 'N/A',
        },
      },
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error retrieving alerts: ${error.message}` }],
    };
  }
}

export async function handleListFiles(params: any) {
  const supabase = getSupabaseClient();
  const { bucket, path = '' } = params;

  if (!bucket) {
    return {
      isError: true,
      content: [{ type: 'text', text: "The 'bucket' parameter is required." }],
    };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error listing files in bucket: ${error.message}` }],
    };
  }
}

export async function handleListRlsPolicies(params: any) {
  const schema = params?.schema || 'public';

  const sql = `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = $1
    ORDER BY tablename, policyname;
  `;

  try {
    const rows = await query(sql, [schema]);
    return {
      content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error listing RLS policies: ${error.message}` }],
    };
  }
}

export async function handleGetActiveConnections() {
  const sql = `
    SELECT 
      pid, 
      usename as user, 
      application_name, 
      client_addr, 
      backend_start, 
      state, 
      wait_event_type, 
      wait_event, 
      query
    FROM pg_stat_activity 
    WHERE state IS NOT NULL
    ORDER BY backend_start DESC;
  `;

  try {
    const rows = await query(sql);
    return {
      content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error retrieving active connections: ${error.message}` }],
    };
  }
}
