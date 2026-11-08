# Implementation tracker

Current status (2026-11-08): production authentication and academic routes are enabled with approved membership checks. Official form UTR-RFC-01 and the 72-hour/two-alternative policy are configured. The checklists below contain historical milestones; [ACCEPTANCE.md](ACCEPTANCE.md) tracks current product journeys. The club leaderboard now derives three actual activity metrics rather than unapproved point values; certificates require manual academic administration. Hosted full grading acceptance, SMTP, and arbitrary PDF scanning still need attention.

## Implemented and locally verified

- [x] Empty-repository inspection, supplied references, Farabi identity, design system.
- [x] Public platform, Jalali calendar/list/week/month, editorial directories/details, club rules, verification page.
- [x] Early Vercel preview and GitHub branch publication.
- [x] Auth handlers/session refresh, profile verification, approved multiple roles and scoped authorization.
- [x] Events, current-semester offerings, relevance, registration, staff attendance and cancellation history.
- [x] Canonical submissions, private versioned uploads, retained originals, file checks, exact-version assessments, zero referral and positive lock.
- [x] Academic/technical administration, record editing, appeals, notifications, reports, audited exceptions.
- [x] Opt-in ranking by confirmed attendance, submitted summaries or accumulated club credit; manual scoped certificate issuance and revocation. Unapproved numerical point/badge values remain disabled.
- [x] Eighteen versioned migrations; isolated PostgreSQL RLS/concurrency tests.
- [x] 51 automated unit/database tests; 14 public browser tests and isolated operational integration tests; captures at 390/768/1440.
- [x] Further user-requested discovery/navigation redesign captured at 390/768/1440; independent visual review completed; all three material fixes scored resolved after recapture.
- [x] Operational, bootstrap, retention, deployment and backup instructions.

## Release gates still open

- [x] Apply hosted schema including the latest club-activity migration; verify RLS, private buckets, approved weekly deadline, rollback-only hosted workflow smoke and Auth. Real hosted Storage/assessment checks remain below.
- [ ] Configure isolated staging Supabase. The free account already has two active projects; no paid upgrade or project pause was authorized.
- [ ] Deferred by user: configure institutional SMTP and test verification/recovery/delivery with real mailboxes.
- [ ] Exercise real hosted Storage/RLS and authenticated mobile upload/assessment across test roles, including revoked sessions and network retries.
- [x] Supply and activate approved official form UTR-RFC-01. Configure a trusted PDF scanner only if PDFs are later enabled.
- [ ] Specify instructor response expectations, attendance exceptions, reversal unlocking and academic-record retention; weekly boundary, 72-hour allowance and two alternative referrals are approved.
- [x] Identify and securely bootstrap the first verified technical and institution-approved academic administrators.
- [ ] Obtain a licensed Damavand webfont for headings; current Vazirmatn is a documented fallback.
- [x] Enable live/signup gates with membership and role checks after explicit owner approval. Full hosted grading acceptance remains open.

## Account launch increment — 2026-11-08

- [x] Real hosted signup without email confirmation, sessions, login/logout, pending membership, role escalation denial and cross-profile isolation verified with temporary accounts then cleaned up.
- [x] Independent account activation gate: academic routes still require UTR_LIVE_ENABLED. 43 automated tests pass, including seven academic-action gate cases.
- [ ] Complete private-upload/assessment hosted acceptance before enabling academic workflows.
- [x] Technical administrator ownership verified and both separately authorized administrative roles bootstrapped.

- [x] Account-only production deployment verified in a real browser: signup, saved profile, logout/login, unauthenticated redirect, blocked academic action, and no horizontal overflow at 390/768/1440. Temporary browser accounts removed after each run.
- [x] Migration 17 initializes only the three user-supplied participating departments, with an audit reason.

- [x] Secure first administrator bootstrap: supplied authenticated profile UUID matched the designated account; technical and explicitly authorized academic roles assigned separately and verified through role predicates. Student status remains unapproved.
