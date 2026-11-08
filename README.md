# UTR — University of Tehran Research Hub

Persian/RTL research platform for the **Farabi campus** of the University of Tehran. The Research Fellows Club is the first operational module. Production academic workflows are active with approved roles, the v2 policy and official form; see [launch record](docs/LAUNCH-APPROVAL.md). The product remains under development against the [journey acceptance matrix](ACCEPTANCE.md), especially administrator usability and hosted grading acceptance.

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

## Official Farabi editorial archive (2026-11-08)

The public redesign includes 19 historical workshop posters (9 for 1403–1404 and 10 for 1404–1405), nine journals with their real covers and fourteen library services/resources. The 1405–1406 archive explicitly says coming soon. Sources are the user-supplied official pages 43935, 50799, 4231 and 4230 on farabi.ut.ac.ir. Titles, presenters, dates and venues were checked against each poster; the 18 Azar 1404 item preserves both sessions. The original posters remain complete and retain their original colors. Optimized local WebP copies have source URLs in public/assets/official/provenance.json.

Production reads published `content` records through anonymous RLS. Administrators use **محتوا و منابع** and choose **رویداد آرشیوی**, **نشریه** or **منبع علمی**; the editor includes year, display date/time, presenter, venue, source, image, contact and order. Unpublishing immediately removes a record from public queries. Archive records have no academic event IDs and cannot create registrations, attendance or credit. Current operational events continue under the existing event workflow.

Isolated previews use the reviewed public snapshot in src/content/official.json; they never query production. This snapshot is real public-source material, not fabricated demonstration data. `scripts/build-official-content.mjs` reproduces that snapshot only. To change production content, use authorized administration or a new reviewed migration; never rewrite the applied import migration. `scripts/import-official-assets.mjs` can re-download provenance-listed official assets. It does not access private files or identities.

The paused/reduced-motion-aware participating-group ribbon is on the club and home pages. `node scripts/review-redesign.mjs` captures 13 routes at 390/768/1440 against a local production server on port 3110; artifacts are ignored by Git. Browser tests cover archive year/filter/detail behavior, official directory links and ribbon controls. Hosted account/file workflows remain subject to the existing release gates.

## Research discovery and navigation refresh (2026-11-08)

The public entry now searches published event archives, journals and resources directly. Search is client-side over the same public/RLS-filtered content already rendered by the site; it does not query or expose academic records. Empty results offer recovery, Escape clears the query and closes results, and external destinations are explicit links.

The mobile header is an accessible disclosure with Escape dismissal and focus return. Active navigation is marked with aria-current. Archive year, query, subject and grid/list preference are stored in URL parameters, so refresh and shared URLs preserve the selection. Existing historical/academic boundaries and account activation gates are unchanged.

Visual research considered the 2026 TCU redevelopment case (https://www.case.org/awards/circle-excellence/2026/core-website-redevelopment) and the Discovery Building agency case (https://www.couleecreative.com/news/discovery-building-website-wins-sotd-awwwards). The applied principles are a working finder, direct navigation, distinct content hierarchy and authentic institutional imagery; no claimed conversion improvements or copied institution-specific assets.

The public browser suite now has 13 tests, including the finder, mobile menu and reload/shareable archive state. `scripts/review-experience-states.mjs` adds 17 hero/search/empty/menu/expanded-result captures to the existing 39-route-size review set. `REVIEW_OUTPUT` and `TEST_BASE_URL` configure the main capture script. New shared presentation is in `src/app/experience.css`; no UI-only change grants additional permissions.

## Signup without activation email

UTR_AUTH_EMAIL_ENABLED controls email password recovery separately from UTR_SIGNUP_ENABLED. A successful signup with a returned session goes directly to profile completion. Membership remains pending until institutional verification. Configure SMTP and test delivery before enabling recovery. The versioned supabase/config.toml declares only reviewed Auth settings; use config diff before config push. The bootstrap script additionally requires BOOTSTRAP_IDENTITY_VERIFICATION documenting independently checked account ownership. Never treat an auto-confirmed email as identity proof.

The opt-in scripts/verify-hosted-auth.mjs uses secure environment credentials and UTR_AUTH_SMOKE_APPROVED=true to exercise temporary auth-only probes, removing them afterwards. It never creates academic fixtures. Latest run passed; full hosted upload/assessment verification remains a separate release gate.

UTR_ACCOUNTS_ENABLED permits authentication, own-profile editing and logout independently of UTR_LIVE_ENABLED. With only accounts enabled, the workspace routes to profile completion and all academic action/file/report endpoints remain blocked. This supports onboarding without claiming the research workflow has passed operational acceptance.

## Role workspaces and integration acceptance

The club participation screen now shows three semester-specific facts: confirmed event attendance, canonical summaries actually submitted, and the sum of instructor-awarded club credit (0–1 per event). A student may opt in to a public name-only leaderboard and choose which of the three measures determines rank. Attendance alone carries no academic score; the displayed credit is not a university grade entry. The former unapproved integer-points leaderboard is not shown. Numerical badge rules remain inactive.

Research administration issues certificates manually in **میز معاونت → مدیریت پژوهشی → صدور دستی گواهی**. Choose an approved student, kind, and for attendance only the attended event; record a reason. The database confirms scope and attendance, records an audit entry, and returns the existing certificate on retry. Revocation uses a labeled certificate selector and reason. Students see issued certificates in **گواهی‌ها** but cannot issue their own. Verification displays only the recipient name, kind, date and validity.

See [the Persian workspace administration guide](docs/WORKSPACES.md) for student, instructor and research administration workflows. Login role selection and the HttpOnly role switch use current approved membership and database roles; selection never grants a role. Technical and academic panels remain separate.

`.github/workflows/integration.yml` starts an ephemeral real Supabase stack in CI, applies every migration, builds Next.js and exercises real Auth sessions, private Storage, attendance, revision versions, zero re-referral, positive locking, concurrent/idempotent requests, appeals, permission revocation and logout. It captures all four workspaces at 390/768/1440. Run 42478954369 passed; fixtures exist only inside the temporary runner. This is separate from actual production-environment acceptance. Local integration mode only accepts the exact loopback Supabase address and is rejected on Vercel.

`node scripts/propose-club-form.mjs` generates a one-page draft form under ignored review artifacts. It is explicitly a proposal and is not uploaded or designated official without institutional approval.
