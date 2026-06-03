# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-01

### Added
- Initial release of the Supabase Self-Hosted MCP server.
- Database tools: `list_tables`, `get_schema`, `execute_sql`.
- Infrastructure tools: `get_advisors`, `get_active_connections`, `list_rls_policies`.
- Auth tools: `list_users`, `create_user`, `delete_user`.
- Storage tools: `list_buckets`, `create_bucket`, `delete_bucket`, `list_files`.
- Docker support with Multi-stage builds.
- One-command execution support via `npx`.
- Initial test suite and linting configuration.
- MIT License and community health files.
