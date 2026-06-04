# Publishing MCP Servers: The Global Distribution Guide

This guide provides a standardized workflow to take an MCP server from a local repository to a mass-adopted tool used by thousands in Cursor, Claude Desktop, and beyond.

---

## 1. Professional Repository Setup
Before publishing, ensure your repository signals maturity and safety.

- **License:** Always use MIT or Apache 2.0. (File: `LICENSE`)
- **Community Health:** Add `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md`.
- **README:** Must include:
  - Visual installation steps for Cursor/Claude Desktop.
  - Required environment variables.
  - Tool list with descriptions.
- **CI/CD:** Add a GitHub Action to verify builds and tests on every PR.

## 2. npm Registry (The "npx" Gold Standard)
The fastest way for users to run your MCP is `npx`.

1. **Verify package.json:**
   - Ensure `type: "module"`.
   - Add a `bin` field: `"bin": { "your-mcp-name": "./dist/index.js" }`.
   - Ensure the entry file starts with `#!/usr/bin/env node`.
2. **Account Setup:** Register at [npmjs.com](https://www.npmjs.com/).
3. **Login:** Run `npm login` in your terminal.
4. **Publish:** Run `npm publish --access public`.

## 3. Smithery.ai (The "App Store" for MCP)
Smithery allows one-click installations for non-technical users.

1. **Config File:** Create a `smithery.yaml` (or let Smithery's bot auto-detect your Dockerfile).
2. **Submission:** Visit [smithery.ai/submit](https://smithery.ai/submit) and paste your GitHub URL.
3. **Validation:** Ensure your `README.md` clearly lists the required environment variables; Smithery uses these to generate installation forms.

## 4. Official Community Listing
Anthropic maintains an index of high-quality servers.

1. **Fork the Index:** Go to [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).
2. **Add Your Entry:** Modify the `README.md` or the relevant directory.
3. **PR Description:** Clearly state why your server is unique (e.g., "Supports Self-Hosted Supabase where the official one only supports Cloud").

## 5. Marketing & Discoverability
- **GitHub Topics:** Add `mcp`, `model-context-protocol`, `claude-desktop`, `cursor-mcp`.
- **Socials:** 
  - Post on **Reddit** (r/ClaudeAI, r/Cursor).
  - Share in the **MCP Discord** or **Supabase Discord**.
- **Versioning:** Use Semantic Versioning (SemVer). Use a tool like `release-please` to automate GitHub Releases.

---
*Created by adiego-101 Community Team*
