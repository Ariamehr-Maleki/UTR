# Implementation tracker

## Implemented and locally verified

- [x] Empty-repository inspection, supplied references, Farabi identity, design system.
- [x] Public platform, Jalali calendar/list/week/month, editorial directories/details, club rules, verification page.
- [x] Early Vercel preview and GitHub branch publication.
- [x] Auth handlers/session refresh, profile verification, approved multiple roles and scoped authorization.
- [x] Events, current-semester offerings, relevance, registration, staff attendance and cancellation history.
- [x] Canonical submissions, private versioned uploads, retained originals, file checks, exact-version assessments, zero referral and positive lock.
- [x] Academic/technical administration, record editing, appeals, notifications, reports, audited exceptions.
- [x] Configurable points/badges/opt-in rankings, certificates and revocation. No production values invented.
- [x] Fourteen versioned migrations; isolated PostgreSQL RLS/concurrency tests.
- [x] 26 automated unit/database tests; 6 browser tests; 18 screenshot captures at 390/768/1440.
- [x] Independent visual review: ship at public/representative-preview scope only.
- [x] Operational, bootstrap, retention, deployment and backup instructions.

## Release gates still open

- [ ] Apply and verify hosted migrations. SQL editor draft was not executed; use current migrations, not the earlier nine-migration draft.
- [ ] Configure isolated staging Supabase, server-only finalizer key and exact environment origins.
- [ ] Configure institutional SMTP and test verification/recovery/delivery with real mailboxes.
- [ ] Exercise real hosted Storage/RLS and authenticated mobile upload/assessment across test roles, including revoked sessions and network retries.
- [ ] Supply approved official form; configure trusted PDF scanner if PDFs are enabled.
- [ ] Approve weekly boundary, revision/referral rules, institutional identity checks and retention policy.
- [ ] Identify and securely bootstrap the first verified technical and institution-approved academic administrators.
- [ ] Confirm exact font (unknown to user); current Vazirmatn remains a substitute.
- [ ] Enable live/signup gates only after the above verification. No production-readiness claim.
