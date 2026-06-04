#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getConfig } from './config/env.js';
import {
  toolsDefinitions,
  handleExecuteSql,
  handleListBuckets,
  handleCreateBucket,
  handleDeleteBucket,
  handleListTables,
  handleListUsers,
  handleCreateUser,
  handleDeleteUser,
  handleGetSchema,
  handleGetAdvisors,
  handleListFiles,
  handleListRlsPolicies,
  handleGetActiveConnections,
} from './tools/index.js';
import { query } from './db/postgres.js';

async function main() {
  // 1. Validar la configuración al inicio
  getConfig();

  // 2. Inicializar el servidor MCP
  const server = new Server(
    {
      name: 'supabase-selfhosted-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  // --- RECURSOS (Resources) ---
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'supabase://database/schema',
          name: 'Complete database schema',
          description: 'Returns the structure of all tables and columns in the public schema.',
          mimeType: 'application/json',
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'supabase://database/schema') {
      const sql = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;
      const rows = await query(sql);
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'application/json',
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
    throw new Error('Resource not found');
  });

  // --- PROMPTS ---
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'audit-security',
          description: 'Performs a complete security audit of the Supabase instance.',
        },
      ],
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name === 'audit-security') {
      return {
        description: 'Supabase Security Audit',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: 'Please perform the following steps to audit my instance:\n1. Use get_advisors to detect performance and RLS issues.\n2. Use list_rls_policies to review all active access rules.\n3. Use get_active_connections to see if there are suspicious accesses or blocks.\n4. Finally, provide a detailed report with security recommendations.',
            },
          },
        ],
      };
    }
    throw new Error('Prompt not found');
  });

  // 3. Registrar el manejador para listar herramientas (Tools)
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolsDefinitions,
    };
  });

  // 4. Registrar el manejador para ejecutar herramientas
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params;

    switch (name) {
      case 'get_schema':
        return await handleGetSchema(params);
      case 'get_advisors':
        return await handleGetAdvisors();
      case 'list_tables':
        return await handleListTables(params);
      case 'execute_sql':
        return await handleExecuteSql(params);
      case 'list_users':
        return await handleListUsers(params);
      case 'create_user':
        return await handleCreateUser(params);
      case 'delete_user':
        return await handleDeleteUser(params);
      case 'list_buckets':
        return await handleListBuckets();
      case 'create_bucket':
        return await handleCreateBucket(params);
      case 'delete_bucket':
        return await handleDeleteBucket(params);
      case 'list_files':
        return await handleListFiles(params);
      case 'list_rls_policies':
        return await handleListRlsPolicies(params);
      case 'get_active_connections':
        return await handleGetActiveConnections();
      default:
        throw new Error(`Tool not found: ${name}`);
    }
  });

  // 5. Configurar el transporte stdio (entrada/salida estándar)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(' Supabase Self-Hosted MCP Server started successfully.');
}

main().catch((error) => {
  console.error(' Fatal error starting MCP server:', error);
  process.exit(1);
});
