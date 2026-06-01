import test from 'node:test';
import assert from 'node:assert';
import { toolsDefinitions } from '../src/tools/index.js';

test('El servidor MCP tiene todas las herramientas requeridas exportadas', (t) => {
  const toolNames = toolsDefinitions.map(tool => tool.name);
  
  const expectedTools = [
    'list_tables',
    'execute_sql',
    'get_schema',
    'get_advisors',
    'list_users',
    'create_user',
    'delete_user',
    'list_buckets',
    'create_bucket',
    'delete_bucket',
    'list_files',
    'list_rls_policies',
    'get_active_connections'
  ];

  for (const expected of expectedTools) {
    assert.ok(toolNames.includes(expected), `Falta la herramienta: ${expected}`);
  }
});

test('Las herramientas tienen un inputSchema válido', (t) => {
  for (const tool of toolsDefinitions) {
    assert.ok(tool.inputSchema, `La herramienta ${tool.name} no tiene inputSchema`);
    assert.strictEqual(tool.inputSchema.type, 'object', `El inputSchema de ${tool.name} debe ser un objeto`);
  }
});
