# UTR — University of Tehran Research Hub

Persian/RTL research platform for the **Farabi campus** of the University of Tehran. The Research Fellows Club is the first operational module. This repository is under implementation; do not enable production until the release gates below are verified.

## Run locally

Node 24; PostgreSQL 15+ (tests exercised on PostgreSQL 18).

```sh
npm ci
cp .env.example .env.local
npm run dev
npm run build
npm test
```

Without explicit activation the public website renders intentional empty states and authenticated services fail closed. `/preview/student` and `/preview/instructor` contain no real records. They are labelled interface previews.

## Environment separation

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the appropriate environment. Production uses project `spqtwgyxzdythfmyzvyh`. Preview requires a **different** project and matching `UTR_PREVIEW_PROJECT_REF`; the application refuses the production project on Vercel preview even when live mode is requested.

Set `APP_ORIGIN` to the exact HTTPS origin. `UTR_LIVE_ENABLED=true` enables database-backed behavior only after verification. `UTR_SIGNUP_ENABLED=true` is a separate release gate. `SUPABASE_SERVICE_ROLE_KEY` is server-only, needed by the image safety finalizer; never prefix it with `NEXT_PUBLIC_`. Configure these in secure Vercel environment settings, not source control. Never reuse the old database password from another conversation.

## Apply schema securely

Obtain a replacement connection credential in Supabase dashboard, store `DATABASE_URL` in a secure local/CI environment, and run `node scripts/migrate.mjs`. The runner uses a migration ledger and SHA-256 checksums. Do not edit applied migrations. The initial migrations have been tested against an isolated local PostgreSQL harness; hosted Supabase Auth/Storage verification is still required. `tests/db-bootstrap.sql` is **only** a local harness and must never run on Supabase.

## Secure superadmin bootstrap

1. Configure Auth redirects and custom SMTP, then create and verify the designated operator's own Auth account. Do not create a shared password.
2. Set `BOOTSTRAP_USER_ID` to that verified account UUID in the secure shell, alongside `DATABASE_URL`.
3. Run `node scripts/bootstrap-superadmin.mjs`. It refuses if a superadmin already exists, takes a database advisory lock and writes an audit reason. It grants technical superadmin only.
4. An explicit institution-approved academic administrator must receive a separate `admin` role and approved membership through a documented, audited operator action. Superadmin does not implicitly gain academic authority.

## Production email

Configure a verified institutional sender and custom SMTP in Supabase Authentication. Add the exact production and staging callback URLs, password recovery URLs, and Site URL. Test signup, verification, reset, recovery link expiry and logout with real test mailboxes. Supabase's restricted default mail service is insufficient for public signup. The app intentionally leaves signup disabled until these checks pass.

## Database tests

Use a disposable database. Create the minimal Auth/Storage harness with `tests/db-bootstrap.sql`, apply every migration in order, then set `TEST_DATABASE_URL` and run `npm test`. The tests impersonate PostgreSQL `authenticated` with distinct user UUIDs, exercising real RLS and concurrent transactions. Without this variable the database suite is explicitly skipped. Never point it at production.

## Core invariants

- One canonical student/event submission, retained attachment versions and immutable assessment decisions.
- Partial unique index permits one active referral; transaction locks serialize referral/assessment races.
- Scores use `numeric(3,2)`, validated 0–1. Any positive result locks further student referral. No course/semester aggregate cap.
- Zero, unrelated course, revision, and administrative review are separate outcomes. Revision stays with the instructor and binds assessment to the submitted attachment version.
- Private Storage, RLS, verified server identity, no cached private file responses, and server-only file-safety finalization.
- Preview data never connects to the production database. Demo fixtures exist only in tests.

## Current release gates

Hosted migrations/RLS/Storage and Auth must be verified; custom SMTP and sender are needed. Institutional decisions are in `DECISIONS.md`. Exact reference typography is unresolved; Vazirmatn is a disclosed fallback. PDF safety scanning is not configured; image uploads are supported, PDF activation remains blocked. No claim of production readiness is made.

See `OPERATIONS.md`, `PRODUCT.md`, `DESIGN.md`, `ROADMAP.md` and `DECISIONS.md`.
