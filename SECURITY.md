# Security Policy

## Supported Versions

We actively support the following versions of Community Resource Board with security updates:

| Version | Supported |
|---------|-----------|
| Latest main branch | ✅ Yes |
| Older releases | ❌ No |

## Reporting a Vulnerability

The security of Community Resource Board is important to us. If you discover a security vulnerability, please report it responsibly.

### Please DO NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before a fix is available
- Exploit the vulnerability beyond proof of concept

### Please DO:
1. Contact the maintainer privately through GitHub
2. Provide detailed information about the vulnerability
3. Include steps to reproduce
4. Allow reasonable time for investigation and patching

## What to Include in a Security Report

To help us investigate quickly, include:

- **Type of issue** (e.g., XSS, SQL injection, authentication bypass)
- **Full paths** of affected source files
- **Step-by-step reproduction** instructions
- **Proof-of-concept** exploit code (if safe)
- **Impact assessment** (what could an attacker do?)
- **Suggested fix** (if available)

## Response Timeline

We aim to acknowledge and address security reports promptly:

- **Acknowledgment:** Within 48-72 hours
- **Initial assessment:** Within 7 days
- **Status updates:** Weekly until resolved
- **Fix release:** As soon as safely possible based on severity

## Security Best Practices Implemented

This project includes several security controls:

### Authentication & Authorization
- JWT-based authentication with expiration
- Role-based access control (User/Organizer/Admin)
- Password hashing using bcryptjs
- Protected routes and middleware enforcement

### API Security
- CORS restrictions for allowed origins
- Rate limiting to prevent brute-force attacks
- Input validation and sanitization
- Helmet.js security headers
- Error handling without sensitive info leakage

### Admin Security
- Admin account creation restricted to existing admins
- Public registration cannot create admin accounts
- Audit logging for admin-only endpoint access attempts
- Secret backend-only admin creation endpoint

### Deployment Security
- Environment variable secrets (no hardcoded keys)
- HTTPS in production deployments
- Secure MongoDB Atlas connection strings

## Known Security Considerations

When self-hosting or forking this project:

1. **Use strong JWT secrets** (minimum 32+ chars random string)
2. **Restrict CORS origins** to trusted domains only
3. **Rotate invite codes** regularly if exposed
4. **Disable debug logs** in production
5. **Keep dependencies updated** to patch vulnerabilities
6. **Monitor auth logs** for suspicious activity
7. **Set up backup strategy** for MongoDB data

## Dependency Security

We recommend running these commands regularly:

```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

## Security Headers Checklist

Ensure these are active in production:

- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HSTS)
- Referrer-Policy

## Contact

For security concerns, contact project maintainers through:
- GitHub private contact methods
- Repository discussions (for non-sensitive security questions)

Thank you for helping keep Community Resource Board secure.
