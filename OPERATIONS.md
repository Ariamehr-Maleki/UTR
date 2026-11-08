# UTR operational runbook

## Initial academic setup

An institution-approved global academic administrator creates departments, semesters, approved instructors, course offerings and student enrollments. Create an immutable policy version only after the institution has approved its parameters. Upload the official club form into the private `forms` bucket, then register its version/path through administration. Publish events with approved form, policy and explicit Tehran deadline. Map related offerings. Confirm actual attendance separately from registration.

The admin UI provides labelled forms and scoped selectors. Instructor approval, student status, event changes, attendance corrections, referrals, assessments, appeals and points are audited. Sensitive updates require a reason. Scope is checked in database functions; UI visibility alone is not authorization.

## Pending policy behavior

The approved v2 policy allows 72 hours after an instructor correction/zero decision (retaining the later original deadline), with at most two alternative referrals. Positive locks never automatically reopen; an appeal does not unlock a submission. Grading policy for final official grades is external to UTR. Attendance alone has no academic score. The opt-in leaderboard uses separate confirmed-attendance, submitted-summary and accumulated-credit measures. Unapproved integer points and badge values remain inactive. Research administration manually issues certificates with a reason and may revoke them; no student self-issue or automatic threshold is active.

## File safety and retention

Private `summaries` and `forms` buckets. Application uploads are limited to 4 MiB to fit Vercel request limits. Images are checked by file signature, decoded with a pixel limit, re-encoded without EXIF, and constrained to 2600×3600 while retaining handwriting readability. Re-encoding is lossy: preview the cleaned file. Originals and cleaned versions are retained privately; live collection must wait for the institution’s retention policy. PDFs require a trusted scanner and are currently rejected with a clear alternative; do not enable them by trusting the browser MIME type.

Pending orphan uploads can be reviewed with `node scripts/cleanup-uploads.mjs`; deletion requires `UTR_CLEANUP_APPLY=true`. Only pending attachments older than 24 hours and not referenced by any referral/assessment are eligible. A transactional claim marks them rejected before deleting original and cleaned objects. Rejected metadata remains; subsequent runs retry failed deletion. This operational orphan threshold is not an academic records retention policy. Retain historical submitted versions and decisions. The institution must approve retention duration, legal holds, erasure exceptions and consent withdrawal before live collection. Do not promise irreversible deletion of academic records before that decision.

Private file API authenticates on every request and returns no-store responses. Logout/permission revocation prevents new requests; already downloaded bytes cannot be remotely revoked. Avoid caching academic files at proxies. Do not email signed URLs.

## Backup and restore

Free-plan backups must be operator-managed. Database backup alone does not back up Storage object bytes.

1. In a secure shell, use a fresh `DATABASE_URL` and `pg_dump --format=custom --file=<encrypted-backup-path>`. Do not embed credentials in command arguments or transcripts; prefer PGPASSFILE or a secure environment.
2. Export both private buckets through the Storage API/S3-compatible endpoint into encrypted storage, preserving object paths, bytes, SHA-256, MIME and a manifest. Use server-side credentials only, short-lived where supported. Include Auth users via supported Supabase export procedures; never export credentials into this repository.
3. Store database and object backups as a coordinated generation with timestamps/checksums. Restrict access, rotate keys and document retention.
4. Restore into an isolated Supabase project. Restore schema/data and private bucket configuration, then upload object bytes at original paths. Reapply grants/RLS and verify counts/hash manifests.
5. Test login, role isolation, attachment access, referral locks, certificate revocation and sample recovery. Record recovery time and recoverable timestamp. Never perform a restore drill against production.

## Monitoring and incidents

Monitor signup/email delivery, failed uploads, pending scanner jobs, database errors, storage/egress, overdue reviews and audit anomalies. Do not log credentials, document bodies or raw auth tokens. Suspend affected accounts through membership state; permissions are checked from current database state. Use a separate academic administrator for disputes. Keep original decisions and add corrections with a reason.

## Free-plan constraints (official pricing checked 2026-11-07)

Supabase Free lists 500 MB database, 1 GB storage, 5 GB egress plus 5 GB cached egress, 50,000 monthly active users, two active projects, and pause after one week of inactivity. Repeated private document access consumes egress. Audit/version retention consumes database/storage. No paid transformations are assumed. No upgrade was purchased.

Sources: https://supabase.com/pricing ; https://supabase.com/docs/guides/auth/auth-smtp ; https://vercel.com/docs/functions/limitations . Recheck limits before launch.
