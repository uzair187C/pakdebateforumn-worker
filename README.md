# 🎤 Pak Debate Forum - Full Stack Web Application

A modern, secure event registration and management platform built for debate forums, competitions, and events. Features JWT authentication, event management, real-time response tracking, and CSV export capabilities.

**Live Demo:** [pakdebateforum.com](https://pakdebateforum.com)

---

## 🌟 Features

### Public Features
- 📋 **Event Registration** - Beautiful registration forms with dynamic question types
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 💬 **Feedback System** - Users can submit structured feedback and ratings
- 🎨 **Modern UI** - Dark theme with smooth animations and professional styling
- ✅ **Form Validation** - Real-time phone number validation and input restrictions

### Admin Portal
- 🔐 **Secure Login** - JWT-based authentication with token expiration
- 📊 **Dashboard** - Real-time statistics and event overview
- ⚙️ **Event Management** - Create, update, and delete events
- ❓ **Dynamic Questions** - Add questions with multiple types (text, email, phone, textarea, select, radio)
- 📝 **Response Tracking** - View all submissions organized by event
- 📥 **CSV Export** - Download all event responses as Excel-compatible CSV files
- 💬 **Feedback Manager** - View all user feedback with ratings and timestamps

---

## 🛠️ Tech Stack

### Frontend
- **HTML/CSS/JavaScript** - Modern vanilla JS with no dependencies
- **Responsive Design** - CSS Grid & Flexbox for all screen sizes
- **LocalStorage** - Secure client-side token management

### Backend
- **Cloudflare Workers** - Serverless compute at the edge
- **Cloudflare D1** - SQLite database on edge
- **JSON Web Tokens (JWT)** - Secure authentication with HMAC-SHA256

### Deployment
- **Cloudflare Pages** - Static assets hosting
- **Custom Domain** - Full control with DNS management
- **Git Integration** - Automatic deployments

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Cloudflare Account (free tier works!)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/uzair187C/pakdebateforumn-worker.git
cd pakdebateforumn-worker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .dev.vars.example .dev.vars
```

4. **Edit `.dev.vars` with your local values:**
```
JWT_SECRET=your-local-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

5. **Run locally:**
```bash
npm run dev
```

6. **Access locally:**
- Main site: http://localhost:8787
- Admin login: http://localhost:8787/admin-login.html

---

## 📦 Deployment

### First Time Setup

1. **Authenticate with Cloudflare:**
```bash
npx wrangler login
```

2. **Set production secrets:**
```bash
npx wrangler secret put ADMIN_USERNAME --env production
npx wrangler secret put ADMIN_PASSWORD --env production
npx wrangler secret put JWT_SECRET --env production
```

3. **Deploy:**
```bash
npm run deploy
```

### Future Deployments
After making changes, just run:
```bash
npm run deploy
```

---

## 📖 Usage Guide

### For Event Participants

1. Visit **Events** page
2. Select an event to register
3. Fill out the registration form
4. Submit to complete registration
5. Submit feedback on the **Feedback** page

### For Administrators

1. Navigate to `/admin` → redirects to login
2. Enter credentials (ADMIN_USERNAME & ADMIN_PASSWORD)
3. Click "Login"

**In the Admin Portal:**

- **Dashboard Tab:** View event statistics
- **Events Tab:** 
  - Create new events with title & description
  - Add questions to events (multiple types supported)
  - View all responses for each event
  - Download responses as CSV
  - Edit or delete events
- **Feedback Tab:** Review all user feedback with ratings

---

## 🗄️ Database Schema

### Events Table
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  question_text TEXT NOT NULL,
  type TEXT, -- text, email, tel, textarea, select, radio
  required INTEGER DEFAULT 0,
  options JSON,
  order_no INTEGER,
  FOREIGN KEY (event_id) REFERENCES events(id)
);
```

### Responses & Answers Tables
```sql
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER,
  question_id INTEGER,
  answer_text TEXT,
  FOREIGN KEY (response_id) REFERENCES responses(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

### Feedbacks Table
```sql
CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER,
  feedback_text TEXT,
  feedback_type TEXT DEFAULT 'general',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Security

### Secrets Management
- **Development:** Stored in `.dev.vars` (git-ignored)
- **Production:** Stored in Cloudflare Secrets (never in code)
- **Never commit:** `.dev.vars`, `.env`, or any API keys

### Authentication
- JWT tokens with 24-hour expiration
- HMAC-SHA256 signature verification
- Automatic token refresh on admin portal
- Logout functionality clears tokens

### Data Protection
- HTTPS enforced on custom domain
- Input validation on all forms
- Phone number field sanitization
- SQL injection protection via parameterized queries
- CORS headers properly configured

For detailed security info, see [SECURITY.md](./SECURITY.md)

---

## 📁 Project Structure

```
pakdebateforumn-worker/
├── src/
│   ├── index.mjs          # Main Worker code & API routes
│   ├── api.js             # (Optional) API helpers
│   └── questions.js       # (Optional) Question utilities
├── public/
│   ├── index.html         # Home page
│   ├── events.html        # Events listing
│   ├── form.html          # Registration form
│   ├── feedback.html      # Feedback page
│   ├── admin-login.html   # Admin login
│   ├── admin-portal.html  # Admin dashboard
│   └── css/
│       └── style.css      # Global styles
├── migrations/
│   ├── 001_init.sql       # Initial schema
│   └── 002_add_feedbacks.sql
├── wrangler.toml          # Cloudflare config
├── package.json           # Dependencies
├── .gitignore             # Git ignore rules
├── .dev.vars.example      # Environment template
├── SECURITY.md            # Security guidelines
└── README.md              # This file
```

---

## 🔧 API Routes

### Public Routes
- `GET /api/events` - List all active events
- `GET /api/form?id={eventId}` - Get event with questions
- `POST /api/submit` - Submit registration
- `POST /api/feedback` - Submit feedback

### Admin Routes (Requires JWT)
- `POST /api/admin/login` - Login with credentials
- `GET /api/admin/events` - List all events
- `POST /api/admin/create-event` - Create event
- `POST /api/admin/update-event` - Update event
- `POST /api/admin/delete-event` - Delete event
- `POST /api/admin/add-question` - Add question to event
- `POST /api/admin/delete-question` - Remove question
- `GET /api/admin/event-detail?id={eventId}` - Get event with all responses
- `GET /api/admin/feedbacks` - Get all feedback
- `GET /api/admin/export-csv?id={eventId}` - Export event responses as CSV

---

## 📊 CSV Export Format

When you export responses, you get a CSV file with:
- **Column 1:** Submission # (newest first)
- **Column 2:** Timestamp of submission
- **Columns 3+:** One column per question with all answers

Perfect for importing into Excel, Google Sheets, or data analysis tools!

---

## 🚧 Future Features

Planned enhancements:
- [ ] Email confirmation on registration
- [ ] Event countdown timers
- [ ] SMS notifications
- [ ] Team management & scoring
- [ ] Analytics dashboard
- [ ] Custom branding per event
- [ ] Payment integration
- [ ] Automated reminders

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Keep secrets out of commits (use `.dev.vars.example`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Tips
- Run locally with `npm run dev` before pushing
- Test admin portal before deploying
- Verify CSV export functionality
- Test on mobile devices
- Check `.gitignore` before committing

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🐛 Troubleshooting

### Admin Login Not Working
- Verify credentials in `.dev.vars` (local) or Cloudflare Secrets (production)
- Check that JWT_SECRET is set
- Clear browser cache and localStorage

### Events Not Showing
- Confirm D1 database is bound in `wrangler.toml`
- Check that production database has events (run migrations)
- Verify database permissions

### CSV Export Empty
- Ensure event has responses submitted
- Check that questions exist for the event
- Verify admin authentication token is valid

### Phone Field Looks Different
- Clear browser cache
- Check CSS autofill rules in form.html
- Update autofill styles if needed

---

## 📧 Support

For issues or questions:
1. Check the [SECURITY.md](./SECURITY.md) for security questions
2. Review existing GitHub Issues
3. Create a new Issue with details

---

## 🎯 Roadmap

**v1.0** ✅ - Core functionality complete
- Event management
- Registration system
- Admin portal
- JWT authentication

**v1.1** 🚧 - In progress
- Email confirmations
- Event timers
- Enhanced analytics

**v2.0** 📅 - Planned
- Team management
- Scoring system
- Mobile app
- API documentation

---

**Built with ❤️ for Pak Debate Forum**

---

### Quick Links
- [GitHub Repository](https://github.com/uzair187C/pakdebateforumn-worker)
- [Live Application](https://pakdebateforum.com)
- [Security Guidelines](./SECURITY.md)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler)
