# Security Policy

## Supported Versions

Currently, only the latest version of the Supabase Self-Hosted MCP server is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within this project, please **do not open a public issue**. Instead, please report it via GitHub's Private Vulnerability Reporting feature or by contacting the maintainers directly.

### Our Commitment
- We will acknowledge receipt of your report within 48 hours.
- We will provide an estimated timeframe for a fix.
- We will notify the community once a patch is available.

### Bypassing RLS Note
Please note that this MCP server is designed for **administrative and development purposes**. By definition, using a `Service Role Key` bypasses Row Level Security. This is an intended feature of the tool and not considered a vulnerability in itself. However, exposures of credentials or remote execution flaws are critical bugs.
