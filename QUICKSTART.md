# Quick Start Guide - Admin Login & Portal

## 🚀 Quick Access

### Live Application
- **Main Website**: https://pakdebateforumn-worker.muzair9d.workers.dev/
- **Admin Login**: https://pakdebateforumn-worker.muzair9d.workers.dev/admin-login.html
- **Admin Portal**: https://pakdebateforumn-worker.muzair9d.workers.dev/admin-portal.html

### Local Development
```bash
# Start dev server
npx wrangler dev --port 8787

# Access locally
Login: http://127.0.0.1:8787/admin-login.html
Portal: http://127.0.0.1:8787/admin-portal.html
```

---

## 🔑 Admin Login Credentials

### Development
**Username**: `admin`
**Password**: `changeme123`

### Production
Set your own credentials via:
```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
```

---

## 📋 Admin Portal Walkthrough

### Dashboard Tab
View quick statistics:
- Total events count
- Total questions count
- Total submissions count
- Top 5 events by submissions

### Events Tab

#### Create New Event
1. Enter Event ID (e.g., `wsdc-2025`)
2. Enter Event Title (e.g., `WSDC 2025`)
3. Enter Description (optional)
4. Click "Create Event"

#### Manage Event
1. Click "View" on any event card
2. In modal, add questions via:
   - Click "Add Question"
   - Enter question text
   - Select type (text, email, textarea, select, etc.)
   - Set required/optional
   - Click "Add Question"
3. See all submissions for the event
4. Click "Edit" to modify event details
5. Click "Delete" to remove event

### Feedback Tab
View all user feedback:
- Name, email, feedback type
- Star ratings (visual display)
- Submission date
- Full feedback text

---

## 🛡️ Authentication Flow

### How It Works

1. **Login**
   - Visit admin login page
   - Enter username and password
   - Click "Login Securely"
   - JWT token generated and stored

2. **Authorization**
   - Token sent with every admin request
   - Server verifies token signature
   - Token expiration checked
   - Access granted or redirected to login

3. **Expiration**
   - Token valid for 24 hours
   - Auto-logout on expiry
   - Redirect to login page
   - Must log in again for fresh token

4. **Logout**
   - Click "Logout" button in admin portal
   - Token cleared from browser
   - Redirected to login page

---

## 🔒 Security Features

✅ **JWT Tokens** - Cryptographically signed
✅ **HMAC-SHA256** - Token tampering prevention
✅ **24-Hour Expiration** - Automatic session timeout
✅ **Authorization Header** - Standard HTTP security
✅ **Environment Secrets** - Credentials not in code
✅ **No External Dependencies** - Uses native Cloudflare APIs

---

## 📝 API Examples

### Get JWT Token
```bash
curl -X POST https://pakdebateforumn-worker.muzair9d.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123"}'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "message": "Login successful"
# }
```

### Use Token for Admin Request
```bash
curl https://pakdebateforumn-worker.muzair9d.workers.dev/api/admin/events \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Response:
# {
#   "success": true,
#   "events": [...]
# }
```

### Create Event
```bash
curl -X POST https://pakdebateforumn-worker.muzair9d.workers.dev/api/admin/create-event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "id": "event-2025",
    "title": "My Event",
    "description": "Event description"
  }'
```

### Add Question to Event
```bash
curl -X POST https://pakdebateforumn-worker.muzair9d.workers.dev/api/admin/add-question \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "event_id": "event-2025",
    "question_text": "What is your name?",
    "type": "text",
    "required": true,
    "order_no": 1
  }'
```

---

## 🚨 Troubleshooting

### Can't Login
1. Check username/password spelling
2. Verify credentials in environment (dev) or secrets (production)
3. Clear browser cache
4. Try incognito/private mode

### "Unauthorized - Please login"
1. Token may have expired (24-hour limit)
2. Log in again to get fresh token
3. Check browser localStorage isn't cleared

### Admin portal blank/not loading
1. Ensure you're logged in first
2. Check browser console for errors
3. Verify JavaScript is enabled
4. Try refreshing page

### Deployment issues
1. Run `npx wrangler secret list` to verify secrets set
2. Check logs: `npx wrangler tail`
3. Ensure all required secrets exist:
   - JWT_SECRET
   - ADMIN_USERNAME
   - ADMIN_PASSWORD

---

## 📚 Documentation Files

- **SECURITY_SETUP.md** - Detailed authentication documentation
- **IMPLEMENTATION_SUMMARY.md** - Complete feature overview
- **README.md** - Project overview

---

## 🔧 Development Commands

```bash
# Start local dev server
npx wrangler dev --port 8787

# Deploy to production
npx wrangler deploy

# Set production secret
npx wrangler secret put JWT_SECRET

# View all secrets
npx wrangler secret list

# Check worker logs
npx wrangler tail

# Access D1 database
npx wrangler d1 shell pakdebate_d1
```

---

## 📊 Event Types & Use Cases

### Web Development Competition
```
ID: webdev-2025
Title: Web Development Championship
- Q1: Full Name (text, required)
- Q2: Email (email, required)
- Q3: Experience Level (select: [Beginner, Intermediate, Advanced], required)
- Q4: Portfolio URL (text, optional)
```

### Academic Conference
```
ID: conference-2025
Title: Annual Academic Conference
- Q1: Full Name (text, required)
- Q2: Institution (text, required)
- Q3: Department (text, required)
- Q4: Paper Title (textarea, optional)
```

### Workshop Registration
```
ID: workshop-security
Title: Cybersecurity Workshop
- Q1: Participant Name (text, required)
- Q2: Email Address (email, required)
- Q3: Background (select: [Beginner, Intermediate, Advanced], required)
- Q4: Any Questions? (textarea, optional)
```

---

## 📱 Mobile Experience

✅ Fully responsive admin login page
✅ Mobile-friendly admin portal
✅ Touch-optimized buttons (44px+)
✅ Responsive forms and tables
✅ Works on all modern browsers

---

## 🎯 Next Steps

1. **First Login**: Use credentials above to access admin portal
2. **Create Event**: Add your first event
3. **Add Questions**: Build out form questions
4. **Test Form**: Submit a test registration from user site
5. **View Submissions**: See submissions in admin portal

---

**Status**: ✅ Production Ready
**Last Updated**: April 19, 2026
**Support**: Refer to SECURITY_SETUP.md or IMPLEMENTATION_SUMMARY.md
