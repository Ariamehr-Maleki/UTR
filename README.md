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
4. For the first institution-approved academic administrator, set `BOOTSTRAP_ACADEMIC_USER_ID` and `UTR_INSTITUTIONAL_APPROVAL_REASON` in the secure shell, then run `node scripts/bootstrap-academic-admin.mjs`. It verifies the Auth account, refuses a second global academic bootstrap and audits the explicit reason. Do not run it without institutional designation. Superadmin does not implicitly gain academic authority.

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

## Browser and CI verification

`npm run build && npm run test:e2e` starts a local server automatically. Windows uses installed Edge; CI installs Chromium. Tests cover public navigation, safe activation gates, private endpoints, keyboard focus and responsive overflow. `node scripts/capture.mjs` captures six routes at three widths. Authenticated hosted flows remain a separate release gate. GitHub Actions applies migrations to disposable PostgreSQL and runs tests/build/browser checks.

## Auth email templates

Configure Supabase email templates to link to the exact application `/auth/callback?token_hash={{ .TokenHash }}&type=email` for verification and `/auth/callback?token_hash={{ .TokenHash }}&type=recovery` for recovery. The callback also supports PKCE code exchange. Use the environment’s approved HTTPS origin, enable email confirmation, and test expired/reused links before signup activation. Never put tokens in logs or analytics.

## Hosting state

The repository began empty; `codex/utr-platform` is its only/default branch. There is no separate base branch for a meaningful PR. Vercel project `utr-farabi` is linked to this repository. `https://utr-farabi.vercel.app` is a gated public preview on the production hostname, not a live academic service. Branch previews may require Vercel account access.

## Isolated operational UI tests

Run `npm run test:workflows` to exercise the actual UploadFlow and Assessment components in a local-only Vite harness. API calls are intercepted with deterministic responses; no Supabase project or real users are involved. Coverage includes mobile failed-upload recovery, attachment retry identifiers, revision instructor lock, exact-version grading, positive-score confirmation, duplicate action prevention and responsive document controls. These tests complement database tests; they do not replace hosted Auth/Storage end-to-end verification. The harness is under tests and is not routed into the deployed Next.js app.

## Public site without account activation

`UTR_PUBLIC_CONTENT_ENABLED=true` enables live published directories, events and certificate verification using a stateless anonymous client and RLS. It grants no academic writes or account access. Private workspace activation remains controlled by `UTR_LIVE_ENABLED`; signup remains a separate gate. Public queries always use anonymous privileges, even when an administrator is logged in, and fetch fresh data per request. Production project references remain blocked on previews. Activation-email work is deferred by the user.
