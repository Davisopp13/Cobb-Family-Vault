# 🔒 Cobb Family Vault

> **Everything your family needs to know, in one safe place.**

A digital "In Case I Die" binder — a secure, organized repository of personal records, financial info, passwords, property details, medical info, emergency contacts, final wishes, and important documents.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite via [Turso](https://turso.tech) |
| ORM | Drizzle ORM |
| Auth | Lucia v3 (session-based) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel (auto-deploy from GitHub) |
| PWA | Web App Manifest + offline fallback |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create Turso Database

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create cobb-family-vault
turso db show cobb-family-vault --url
turso db tokens create cobb-family-vault
```

### 3. Run Database Migrations

```bash
# Push schema to Turso
npm run db:push

# Or run manually:
turso db shell cobb-family-vault < drizzle/0000_init.sql
```

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
NEXT_PUBLIC_APP_URL=https://cobb-family-vault.vercel.app
```

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/setup` for first-run.

---

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXT_PUBLIC_APP_URL`
4. Deploy

---

## The 15 Default Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | 👤 Personal Information | Legal name, SSN, IDs |
| 2 | 👨‍👩‍👧‍👦 Family & Contacts | Family, emergency contacts |
| 3 | 🏥 Medical Information | Health, medications, DNR |
| 4 | 🐕 Pet Information | Pets, vet, care instructions |
| 5 | 🏠 Property & Home | Mortgage, HOA, security codes |
| 6 | 💰 Financial Accounts | Bank, investments, retirement |
| 7 | 💳 Credit Cards | Cards, subscriptions |
| 8 | 🛡️ Insurance | All insurance policies |
| 9 | 🔐 Passwords & Digital | Password manager, accounts |
| 10 | 📄 Legal Documents | Will, trust, power of attorney |
| 11 | 💼 Employment & Income | Employer, benefits, pension |
| 12 | 🔧 House How-Tos | Shutoffs, maintenance |
| 13 | 📝 Final Wishes | Funeral, burial preferences |
| 14 | 💌 Letters & Messages | Personal letters to family |
| 15 | 📋 Additional Notes | Anything else |
