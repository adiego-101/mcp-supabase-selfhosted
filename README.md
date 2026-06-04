# Supabase Self-Hosted MCP Server

[![smithery badge](https://smithery.ai/badge/mcp-supabase-selfhosted)](https://smithery.ai/server/mcp-supabase-selfhosted)

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

## Quick Start (Recommended)

The easiest way to use this server in **Claude Desktop**, **Cursor**, or **Gemini CLI** is via `npx`. No manual installation or cloning required.

### Configuration for Claude Desktop / Cursor
Add this to your `claude_desktop_config.json` or Cursor settings:

```json
{
  "mcpServers": {
    "supabase-selfhosted": {
      "command": "npx",
      "args": ["-y", "mcp-supabase-selfhosted"],
      "env": {
        "SUPABASE_URL": "http://your-ip:8000",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "DATABASE_URL": "postgresql://postgres:postgres@your-ip:5432/postgres"
      }
    }
  }
}
```

### Installation and Usage (Local)

If you prefer to clone the repository:
...
## Usage with Docker

You can also run the server using Docker to keep your environment clean.
...
### One-Command Usage (CLI only)
```bash
# Set your environment variables first, then run:
npx mcp-supabase-selfhosted
```
...

## Security and Best Practices

- **Direct Access:** This MCP uses direct DB connections and the `SERVICE_ROLE_KEY`. This means the connected AI will have **full, unrestricted access (bypassing RLS)** to your instance.
- **Environments:** It is strongly recommended to use this **only in local development environments**, never pointing to a production database with sensitive real data.
- **Transport:** The server uses `stdio` (standard input/output), which is the default security protocol in desktop applications like Cursor and Claude.
- **Destructive Actions:** Tools like `delete_user` or `delete_bucket` require an explicit `confirm: true` flag to prevent accidental data loss.

## Contributing

Contributions are welcome! Feel free to open Issues or Pull Requests. If you plan to add a new tool, add it to the `src/tools/` directory.

## License
MIT
