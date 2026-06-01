import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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
      },
    },
  );

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

  console.error('🚀 Servidor MCP de Supabase Self-Hosted iniciado correctamente.');
}

main().catch((error) => {
  console.error('❌ Error fatal al iniciar el servidor MCP:', error);
  process.exit(1);
});
