import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getConfig } from "./config/env.js";

async function main() {
  // 1. Validar la configuración al inicio
  const config = getConfig();
  
  // 2. Inicializar el servidor MCP
  const server = new Server(
    {
      name: "supabase-selfhosted-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 3. Registrar el manejador para listar herramientas (Tools)
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "ping",
          description: "Herramienta de prueba para verificar que el MCP Server está respondiendo correctamente.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        }
      ],
    };
  });

  // 4. Registrar el manejador para ejecutar herramientas
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;

    if (name === "ping") {
      return {
        content: [
          {
            type: "text",
            text: "¡Pong! El servidor MCP de Supabase Self-Hosted está funcionando y listo para recibir comandos.",
          },
        ],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  });

  // 5. Configurar el transporte stdio (entrada/salida estándar)
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // No usamos console.log aquí porque stdio es usado por el protocolo MCP.
  // Cualquier salida de console.log puede corromper el JSON-RPC.
  // Si necesitas depurar, usa console.error (que va a stderr y los clientes MCP lo ignoran o lo muestran como logs)
  console.error("🚀 Servidor MCP de Supabase Self-Hosted iniciado correctamente.");
}

main().catch((error) => {
  console.error("❌ Error fatal al iniciar el servidor MCP:", error);
  process.exit(1);
});
