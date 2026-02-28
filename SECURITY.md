# Security Policy

## Supported Versions

Security updates are provided for the latest version of Electron MCP Server.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to maintain the safety of our users.

**Do NOT open a public issue.**

Instead, please send an email to:

- **Email**: kanishka.namdeo@gmail.com
- **Subject**: Security Vulnerability Report - Electron MCP Server

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes or mitigations

## What Happens Next?

1. **Acknowledge**: We will acknowledge receipt of your report within 48 hours
2. **Validation**: We will validate and investigate the vulnerability
3. **Remediation**: We will work on a fix in a secure manner
4. **Disclosure**: We will coordinate disclosure with you at a mutually agreed time

## Security Best Practices

When using Electron MCP Server, ensure:

- Only run trusted Electron applications
- Keep dependencies updated
- Review and validate any auto-generated tests
- Use appropriate session isolation for concurrent testing
- Do not expose MCP server endpoints publicly without authentication

## Electron Security

Electron MCP Server interacts with Electron applications. Ensure your Electron app follows:
- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security/)
- Proper context isolation
- Secure IPC communication
- Safe webPreferences configuration
