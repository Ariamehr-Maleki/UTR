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
- [x] Sixteen versioned migrations; isolated PostgreSQL RLS/concurrency tests.
- [x] 29 automated unit/database tests; 13 public browser tests plus 9 operational-component browser tests; 39 public/representative screenshot captures plus 17 discovery/navigation state captures at 390/768/1440.
- [x] Further user-requested discovery/navigation redesign captured at 390/768/1440; independent visual review completed; all three material fixes scored resolved after recapture.
- [x] Operational, bootstrap, retention, deployment and backup instructions.

## Release gates still open

- [x] Apply 16 hosted migrations; verify 27 RLS-enabled tables, private buckets, approved weekly deadline, and rollback-only hosted workflow smoke tests. Auth/Storage end-to-end checks remain below.
- [ ] Configure isolated staging Supabase, server-only finalizer key and exact environment origins.
- [ ] Deferred by user: configure institutional SMTP and test verification/recovery/delivery with real mailboxes.
- [ ] Exercise real hosted Storage/RLS and authenticated mobile upload/assessment across test roles, including revoked sessions and network retries.
- [ ] Supply approved official form; configure trusted PDF scanner if PDFs are enabled.
- [ ] Approve revision/referral rules, institutional identity checks and retention policy. Weekly boundary is approved.
- [ ] Identify and securely bootstrap the first verified technical and institution-approved academic administrators.
- [ ] Confirm exact font (unknown to user); current Vazirmatn remains a substitute.
- [ ] Enable live/signup gates only after the above verification. No production-readiness claim.

## Account launch increment — 2026-11-08

- [x] Real hosted signup without email confirmation, sessions, login/logout, pending membership, role escalation denial and cross-profile isolation verified with temporary accounts then cleaned up.
- [x] Independent account activation gate: academic routes still require UTR_LIVE_ENABLED. 43 automated tests pass, including seven academic-action gate cases.
- [ ] Complete private-upload/assessment hosted acceptance before enabling academic workflows.
- [ ] Technical administrator email supplied; ownership verification and secure bootstrap remain pending.

- [x] Account-only production deployment verified in a real browser: signup, saved profile, logout/login, unauthenticated redirect, blocked academic action, and no horizontal overflow at 390/768/1440. Temporary browser accounts removed after each run.
- [x] Migration 17 initializes only the three user-supplied participating departments, with an audit reason.

- [x] Secure first administrator bootstrap: supplied authenticated profile UUID matched the designated account; technical and explicitly authorized academic roles assigned separately and verified through role predicates. Student status remains unapproved.
