# Admin Authentication & Security Setup

## Overview
This document covers the JWT-based admin authentication system implemented for the Pak Debate Forum Worker.

## Features Implemented

### ✓ JWT Token Generation
- Uses Web Crypto API (HMAC-SHA256)
- Tokens include admin flag, username, issue time (iat), and expiration (exp)
- Default expiration: 24 hours
- No external dependencies (native Cloudflare Workers APIs)

### ✓ Secure Login Endpoint
- POST `/api/admin/login` accepts username and password
- Credentials validated against environment variables
- Returns JWT token on success
- Returns 401 Unauthorized on failure

### ✓ Token Verification
- All admin endpoints require Bearer token in Authorization header
- Token signature validated using HMAC-SHA256
- Token expiration checked
- Automatic logout on expired/invalid tokens
- Graceful redirect to login page

### ✓ Admin Portal Security
- Automatic redirect to login if no valid token
- Token stored securely in localStorage
- Logout button clears token
- All API requests include Authorization header

## Development Setup

### .dev.vars Configuration
Create a `.dev.vars` file in the project root with:

```
JWT_SECRET=super-secret-development-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
ADMIN_TOKEN=mysuperadmintoken123
```

### Running Locally
```bash
npx wrangler dev --port 8787
```

Access:
- Login page: http://127.0.0.1:8787/admin-login.html
- Admin portal: http://127.0.0.1:8787/admin-portal.html (requires login)

## Production Deployment

### ⚠️ CRITICAL: Set Production Secrets

After deploying, you MUST set the production secrets:

```bash
# Set JWT secret (use a strong random key)
npx wrangler secret put JWT_SECRET

# Set admin username
npx wrangler secret put ADMIN_USERNAME

# Set admin password (use a strong password)
npx wrangler secret put ADMIN_PASSWORD
```

When prompted, enter:
- **JWT_SECRET**: A strong random key (e.g., generated from: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **ADMIN_USERNAME**: Your desired admin username (e.g., "admin" or custom)
- **ADMIN_PASSWORD**: A strong, unique password

### Example Production Setup
```bash
# In your terminal:
$ npx wrangler secret put JWT_SECRET
Enter the secret text:
> [paste-strong-random-key]
⚡ Successfully created secret for 'pakdebateforumn-worker'

$ npx wrangler secret put ADMIN_USERNAME  
Enter the secret text:
> admin
⚡ Successfully created secret for 'pakdebateforumn-worker'

$ npx wrangler secret put ADMIN_PASSWORD
Enter the secret text:
> [paste-strong-password]
⚡ Successfully created secret for 'pakdebateforumn-worker'
```

### Verify Production Secrets
```bash
npx wrangler secret list
```

Should show:
- JWT_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD

## Architecture

### Token Flow
```
User Login Form
    ↓
POST /api/admin/login (username + password)
    ↓
Validate against env variables
    ↓
Generate JWT (HS256)
    ↓
Return token to client
    ↓
Client stores in localStorage
    ↓
Client sends with all admin requests
    ↓
Server verifies token
    ↓
Grant access or redirect to login
```

### JWT Structure
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { 
  "admin": true,
  "username": "admin",
  "iat": 1776577551,
  "exp": 1776663951
}
Signature: HMAC-SHA256(header.payload, JWT_SECRET)
```

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/events` - List all events
- `GET /api/form?id={eventId}` - Get event form questions
- `POST /api/submit` - Submit form response
- `POST /api/feedback` - Submit feedback

### Protected Admin Endpoints (JWT Required)
- `POST /api/admin/login` - Get JWT token
- `GET /api/admin/events` - List all events
- `POST /api/admin/create-event` - Create event
- `POST /api/admin/update-event` - Update event
- `POST /api/admin/delete-event` - Delete event
- `POST /api/admin/add-question` - Add question to event
- `POST /api/admin/delete-question` - Delete question
- `GET /api/admin/event-detail?id={eventId}` - Get event details with submissions
- `GET /api/admin/feedbacks` - Get all feedback

### Authorization Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwic2...
```

## Security Best Practices

### ✅ Implemented
1. **JWT Tokens**: Stateless authentication
2. **Token Expiration**: 24-hour default TTL
3. **HMAC Signature**: Prevents token tampering
4. **Environment Variables**: Credentials not in code
5. **Bearer Token Auth**: Standard HTTP authorization
6. **Automatic Logout**: Redirects on invalid/expired token

### ✅ Client-Side Security
1. Token stored in localStorage (not cookies to prevent CSRF)
2. Token cleared on logout
3. Automatic redirect to login on 401
4. Form validation on all inputs

### ⚠️ Future Enhancements
1. **Refresh Tokens**: Implement token refresh endpoint for extended sessions
2. **Password Hashing**: Upgrade from plaintext comparison to bcrypt
3. **Rate Limiting**: Add login attempt rate limiting
4. **Audit Logging**: Log all admin actions
5. **IP Whitelisting**: Restrict admin access to specific IPs
6. **2FA**: Add two-factor authentication
7. **Session Management**: Track active sessions and allow revocation

## Testing

### Test Login Flow (Development)
```bash
# 1. Get token
curl -X POST http://127.0.0.1:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123"}'

# Response:
# {"success":true,"token":"eyJhbGciOilIUlI1NiIsInR5cCI6IkpXVCJ9..."}

# 2. Use token to access protected endpoint
curl http://127.0.0.1:8787/api/admin/events \
  -H "Authorization: Bearer eyJhbGciOilIUlI1NiIsInR5cCI6IkpXVCJ9..."

# Should return list of events
# {"success":true,"events":[...]}

# 3. Try without token (should fail)
curl http://127.0.0.1:8787/api/admin/events

# Response:
# {"success":false,"error":"Unauthorized - Please login"}
```

## File Structure
```
src/
├── index.mjs                 (Updated with JWT functions + login endpoint)
public/
├── admin-login.html         (NEW - Secure login page)
├── admin-portal.html        (Updated - Token authentication)
.dev.vars                    (Development environment variables)
wrangler.toml               (Updated - cleaned up config)
SECURITY_SETUP.md           (This file)
```

## Troubleshooting

### "Invalid credentials" on login
- Check that `ADMIN_USERNAME` and `ADMIN_PASSWORD` match in `.dev.vars`
- Clear browser cache and localStorage
- Restart dev server: `npx wrangler dev --port 8787`

### "Unauthorized - Please login" on admin endpoint
- Token may have expired (24-hour TTL)
- Log in again to get a fresh token
- Check that Authorization header is properly formatted: `Bearer [token]`

### Admin portal redirects to login after refresh
- Token is stored in localStorage but may be cleared
- This is expected behavior for security
- Log in again to continue

### Deployment fails with "secret not set"
- In production, you MUST run `npx wrangler secret put [KEY]`
- Environment variables are development-only
- Secrets are required for production deployment

## Cloudflare Workers Resources
- [Secrets Documentation](https://developers.cloudflare.com/workers/platform/secrets/)
- [Environment Variables](https://developers.cloudflare.com/workers/platform/environment-variables/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Support
For questions about the authentication system, refer to Cloudflare Workers documentation or contact the development team.
