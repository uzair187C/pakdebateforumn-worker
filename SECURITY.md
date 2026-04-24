# 🔒 Security Guidelines

## Environment Variables

**DO NOT commit `.dev.vars` file** — it contains sensitive credentials!

### Setting up locally:

1. Copy the example file:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Fill in your local values:
   ```
   JWT_SECRET=your-local-secret-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-password
   ```

3. Never commit `.dev.vars` — it's in `.gitignore`

## Production Secrets

Your production secrets are stored **safely in Cloudflare**, not in code:

```powershell
# Set production secrets (these go to Cloudflare, not GitHub)
npx wrangler secret put JWT_SECRET --env production
npx wrangler secret put ADMIN_USERNAME --env production
npx wrangler secret put ADMIN_PASSWORD --env production
```

These are **never** visible in the code or GitHub repo.

## What's Safe to Commit

✅ **Source code** (`src/`, `public/`)  
✅ **Configuration** (`wrangler.toml`, `package.json`)  
✅ **Migrations** (`migrations/`)  
✅ **Documentation** (`README.md`, etc.)  

## What's NOT Safe to Commit

❌ `.dev.vars` (actual secrets)  
❌ `.env` files (any environment files)  
❌ API keys or tokens (anywhere)  
❌ `node_modules/` (dependencies)  

## Database

- ✅ **Production database** is on Cloudflare D1 (safe)
- ❌ **Local `.db` files** are gitignored

## Summary

Your GitHub repo is secure because:
1. `.gitignore` prevents accidental secret commits
2. `.dev.vars` is never pushed
3. Production secrets live in Cloudflare only
4. All code is safe to share publicly

**All good to push! 🚀**
