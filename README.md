# Supabase Self-Hosted MCP Server

Un servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) diseñado específicamente para instancias **Self-Hosted de Supabase**. 

A diferencia del servidor MCP oficial que depende en gran medida de las APIs de la nube de Supabase y del `project-ref`, esta versión se conecta directamente a tu base de datos PostgreSQL local y a las APIs locales (Auth/Storage) usando tu `SUPABASE_URL` y tu `SERVICE_ROLE_KEY`.

## ✨ Características

- 📊 **Introspección de Base de Datos:** Lista tablas y esquemas de tu Postgres.
- ⚡ **Ejecución SQL Raw:** Ejecuta consultas SQL directamente, permitiendo a la IA leer datos o modificar la estructura (bypass de RLS).
- 🔐 **Gestión de Autenticación:** Lista usuarios registrados en tu instancia.
- 📦 **Gestión de Storage:** Lista buckets de almacenamiento.

## 🚀 Requisitos

- Node.js >= 18
- Docker (opcional, pero recomendado)

## 🛠️ Instalación y Uso (Local)

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/mcp-supabase-selfhosted.git
   cd mcp-supabase-selfhosted
   ```

2. Instala las dependencias y compila:
   ```bash
   npm install
   npm run build
   ```

3. Crea tu archivo de entorno:
   ```bash
   cp .env.example .env
   ```
   Rellena tus credenciales (asegúrate de usar la **Service Role Key**, ¡nunca la anónima!).

## 🐳 Uso con Docker (Recomendado)

La forma más limpia de utilizar este servidor en clientes IA (Cursor, Claude, Gemini) sin ensuciar tu entorno local es usar la imagen de Docker.

1. Construye la imagen localmente:
   ```bash
   docker build -t supabase-selfhosted-mcp .
   ```

### Configuración en Claude Desktop / Cursor
Añade lo siguiente a tu archivo `claude_desktop_config.json` o configuración de Cursor:

```json
{
  "mcpServers": {
    "supabase-selfhosted": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "SUPABASE_URL=http://host.docker.internal:8000",
        "-e", "SUPABASE_SERVICE_ROLE_KEY=tu-clave-aqui",
        "-e", "DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/postgres",
        "supabase-selfhosted-mcp"
      ]
    }
  }
}
```
*(Nota: usa `host.docker.internal` en lugar de `localhost` si tu base de datos corre en tu máquina host).*

### Configuración en Gemini CLI
Puedes añadirlo en tu archivo `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "supabase-selfhosted": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "SUPABASE_URL=...",
        "-e", "SUPABASE_SERVICE_ROLE_KEY=...",
        "-e", "DATABASE_URL=...",
        "supabase-selfhosted-mcp"
      ]
    }
  }
}
```

## 🛡️ Seguridad y Buenas Prácticas

- **Acceso Directo:** Este MCP utiliza conexiones directas a DB y la `SERVICE_ROLE_KEY`. Esto significa que la IA conectada tendrá acceso **total y sin restricciones (bypassing RLS)** a tu instancia.
- **Entornos:** Se recomienda encarecidamente utilizar esto **sólo en entornos de desarrollo local**, nunca apuntando a una base de datos de producción con datos reales sensibles.
- **Transporte:** El servidor usa `stdio` (entrada/salida estándar), lo cual es el protocolo de seguridad predeterminado en aplicaciones de escritorio como Cursor y Claude.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sientete libre de abrir Issues o Pull Requests. Si planeas añadir una herramienta nueva, añádela en el directorio `src/tools/`.

## Licencia
MIT
