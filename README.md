# Supabase Self-Hosted MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server designed specifically for **Self-Hosted Supabase** instances.

Unlike the official Supabase MCP server which heavily relies on Supabase Cloud APIs and the `project-ref`, this version connects directly to your local PostgreSQL database and local APIs (Auth/Storage) using your `SUPABASE_URL` and `SERVICE_ROLE_KEY`.

## Features

- **Database Introspection:** List tables and schemas in your Postgres database.
- **Raw SQL Execution:** Execute SQL queries directly, allowing the AI to read data or modify the structure (bypassing RLS).
- **Authentication Management:** List and manage users registered in your instance.
- **Storage Management:** List buckets and files.
- **Resources:** Access the complete database schema via URI (`supabase://database/schema`).
- **Prompts:** Integrated prompt templates for security audits and optimization.
- **Infrastructure Diagnostics:** Monitor active connections and get performance advisors (unused indexes, cache health).

## Requirements

- Node.js >= 18
- Docker (optional, but recommended)

## Installation and Usage (Local)

1. Clone the repository:
   ```bash
   git clone https://github.com/adiego-101/mcp-supabase-selfhosted.git
   cd mcp-supabase-selfhosted
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials (ensure you use the **Service Role Key**, never the anonymous one!).

## Usage with Docker (Recommended)

The cleanest way to use this server in AI clients (Cursor, Claude, Gemini) without cluttering your local environment is to use the Docker image.

1. Build the image locally:
   ```bash
   docker build -t supabase-selfhosted-mcp .
   ```

### Configuration in Claude Desktop / Cursor
Add the following to your `claude_desktop_config.json` or Cursor configuration:

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
        "-e", "SUPABASE_SERVICE_ROLE_KEY=your-key-here",
        "-e", "DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/postgres",
        "supabase-selfhosted-mcp"
      ]
    }
  }
}
```
*(Note: use `host.docker.internal` instead of `localhost` if your database is running on your host machine).*

### One-Command Usage (via npx)
If you have the package installed or want to run it directly:
```bash
npx mcp-supabase-selfhosted
```

## Security and Best Practices

- **Direct Access:** This MCP uses direct DB connections and the `SERVICE_ROLE_KEY`. This means the connected AI will have **full, unrestricted access (bypassing RLS)** to your instance.
- **Environments:** It is strongly recommended to use this **only in local development environments**, never pointing to a production database with sensitive real data.
- **Transport:** The server uses `stdio` (standard input/output), which is the default security protocol in desktop applications like Cursor and Claude.
- **Destructive Actions:** Tools like `delete_user` or `delete_bucket` require an explicit `confirm: true` flag to prevent accidental data loss.

## Contributing

Contributions are welcome! Feel free to open Issues or Pull Requests. If you plan to add a new tool, add it to the `src/tools/` directory.

## License
MIT
