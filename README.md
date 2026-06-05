# CreaterHub — Creator Platform

An online course platform built for Indian creators. Sell courses, manage students, accept payments via Razorpay/UPI, generate GST invoices, and build a branded website — all from one dashboard.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Laravel 11 (PHP 8.3), Laravel Sanctum |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Laravel Queues |
| File Storage | Cloudflare R2 (S3-compatible) |
| Video | Mux (upload, transcode, HLS playback) |
| Payments | Razorpay (India) + Stripe (international) |
| Email | Resend via Laravel Mail |

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 20+
- PHP 8.3 + Composer
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/shah8588/createrhub.git
cd createrhub

# 2. Start Docker services (PostgreSQL, Redis, MinIO, Mailpit)
docker compose up -d

# 3. Setup backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# 4. Setup frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Laravel API: http://localhost:8000
- MinIO Console: http://localhost:9001 (user: `minioadmin` / pass: `minioadmin`)
- Mailpit (catch emails): http://localhost:8025
- Prisma Studio: `cd backend && php artisan tinker`

### Test Credentials (seeded)
- Creator: `shah@test.com` / `password`
- Student: `student@test.com` / `password`

## Project Structure

```
createrhub/
├── frontend/          # Next.js 14 App Router
├── backend/           # Laravel 11 API
├── docker/            # Nginx config, PHP Dockerfile
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml
```

## Branch Strategy

- `main` — production
- `develop` — staging (auto-deploys on push)
- `feature/*` — feature branches (PR → develop)

## Documentation

- [Design Specification](./creator_platform_design_spec.html) — UI/UX specs for all 68 pages
- [Master Task List](./creator_platform_master_tasks.html) — 285 tasks across 6 phases
