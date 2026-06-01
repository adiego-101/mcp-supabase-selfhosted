import { query } from '../db/postgres.js';
import { getSupabaseClient } from '../supabase/client.js';

export const toolsDefinitions = [
  {
    name: 'list_tables',
    description: 'Lista todas las tablas en un esquema específico de la base de datos PostgreSQL.',
    inputSchema: {
      type: 'object',
      properties: {
        schema: {
          type: 'string',
          description: "El nombre del esquema (ej. 'public', 'auth'). Por defecto es 'public'.",
        },
      },
    },
  },
  {
    name: 'execute_sql',
    description:
      'Ejecuta una consulta SQL cruda en la base de datos PostgreSQL de Supabase. Útil para leer datos, modificar esquemas o administrar la base de datos. ATENCIÓN: Esta herramienta tiene acceso directo, sin pasar por RLS.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'La consulta SQL a ejecutar.',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_users',
    description:
      'Lista los usuarios registrados en el servicio de Autenticación de Supabase (auth.users). Devuelve información básica de los usuarios.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'El número de página para paginación (por defecto 1).',
        },
        perPage: {
          type: 'number',
          description: 'La cantidad de usuarios por página (por defecto 50).',
        },
      },
    },
  },
  {
    name: 'list_buckets',
    description:
      'Lista todos los buckets de almacenamiento (Storage) configurados en el proyecto de Supabase.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_schema',
    description:
      'Obtiene el esquema de la base de datos o de una tabla específica. Útil para entender la estructura antes de ejecutar SQL.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description:
            'Nombre de la tabla para obtener sus columnas. Si se omite, devuelve una lista de todas las tablas con sus columnas.',
        },
        schema: {
          type: 'string',
          description: "El nombre del esquema (ej. 'public'). Por defecto es 'public'.",
        },
      },
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
      content: [{ type: 'text', text: `Error obteniendo esquema: ${error.message}` }],
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
      content: [{ type: 'text', text: `Error listando tablas: ${error.message}` }],
    };
  }
}

export async function handleExecuteSql(params: any) {
  const { sql } = params;
  if (!sql) {
    return {
      isError: true,
      content: [{ type: 'text', text: "El parámetro 'sql' es obligatorio." }],
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
      content: [{ type: 'text', text: `Error ejecutando SQL: ${error.message}` }],
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
      content: [{ type: 'text', text: `Error listando usuarios: ${error.message}` }],
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
      content: [{ type: 'text', text: `Error listando buckets: ${error.message}` }],
    };
  }
}
