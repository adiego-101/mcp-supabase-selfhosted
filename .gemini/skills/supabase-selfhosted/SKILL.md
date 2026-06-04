---
name: supabase-selfhosted
description: Use when you need to interact with a self-hosted Supabase instance to configure Auth, Storage, manage the database schema, apply RLS policies, or debug performance.
---

# Skill: Supabase Self-Hosted MCP

This skill guides the agent on how to correctly and safely utilize the `supabase-selfhosted` MCP server tools to interact with a self-hosted Supabase environment.

## 1. When to Use
Activate this skill whenever the user asks to:
- "Setup a test user in auth."
- "Create a bucket for my images."
- "Review RLS security policies."
- "Fix database performance issues."
- "See what columns a table has in my Supabase."

## 2. Security and RLS (Row Level Security) Mandates
**Critical:** Because this MCP uses the `SUPABASE_SERVICE_ROLE_KEY` and direct PostgreSQL connections, **it bypasses Row Level Security (RLS) entirely.**
- When you create tables or schemas using `execute_sql`, you MUST strongly recommend or automatically apply RLS policies unless explicitly told otherwise.
- Use `list_rls_policies` to audit existing security rules.
- If the `get_advisors` tool flags tables without RLS, you should proactively offer to write the SQL to secure them.

## 3. Recommended Workflows

### A. Exploring the Database
1. Run `list_tables` to see what exists.
2. Run `get_schema({ table_name: "X" })` to understand columns before writing any SQL.
3. Run `get_advisors()` to check for missing indexes or security gaps.
4. Access the source of truth schema via the resource `supabase://database/schema`.

### B. Configuring Auth
1. Use `list_users` to see who is registered.
2. Use `create_user({ email, password, email_confirm: true })` to bootstrap administrative or test accounts without needing an SMTP server configured locally.
3. If asked to clean up, use `delete_user({ user_id, confirm: true })`.

### C. Configuring Storage (Buckets)
1. Use `list_buckets()` to check existing buckets.
2. Use `create_bucket({ bucket: "name", public: true/false })` to make a new one. Remember: making a bucket public allows read access without auth, but RLS policies are still recommended via the `storage.objects` table.
3. Use `list_files({ bucket: "name" })` to verify uploads.

### D. Debugging and Infrastructure
- If the user complains about "Too many connections" or database hanging, immediately run `get_active_connections()` to identify locked processes or long-running queries.
- Run `get_advisors()` and report the `cache_health` and `unused_indexes` so the user can optimize their self-hosted VPS resources.

## 4. Examples

**Creating a Secure Table with RLS:**
If asked to create a `posts` table, execute:
```sql
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
```
*(Always use `execute_sql` with robust SQL strings).*
