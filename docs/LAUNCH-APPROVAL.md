# Approved launch configuration — 2026-11-08

The designated research administrator explicitly approved production academic activation after disclosure of isolated-test versus production verification limits. Production-only `UTR_LIVE_ENABLED=true` was accepted. Preview isolation is unchanged.

## Institutional policy v2

- ID: `63075908-a97e-4eb8-9221-fd10a3ea9f65`.
- Name: `UTR club policy v2 — 72h / 2 alternatives`.
- Week starts Saturday; deadline Friday 23:59:59 Asia/Tehran.
- Revision and zero-referral grace: 72 hours after the instructor decision, retaining the original deadline when later.
- Two alternative referrals, in addition to the initial referral.
- Attendance exceptions, participation scoring and certificates remain disabled; review SLA unset.
- Earlier policies and submission snapshots were not rewritten.

Recorded through guarded `admin_action` and `set_week_policy` operations on behalf of the explicitly authorizing administrator, with audit reasons identifying agent-mediated approval. These are configuration records, not schema changes.

## Official form v1

- ID: `8b212bbb-c5f4-4797-bd57-9682f5610d81`.
- Version: `UTR-RFC-01`.
- [Approved one-page PDF](forms/UTR-RFC-01.pdf).
- Private object: `forms/official/UTR-RFC-01.pdf`.
- SHA-256: `70db67350831a2a466b94cedae5ea49c5b7d2a7e92a3527443c0a95b8de6e30e`.
- 125993 bytes; private byte readback matched; public Storage access denied.

The administrator approved the reviewed structure explicitly; draft labels were removed. This is an authored trusted release asset uploaded by an operator, not an arbitrary student PDF accepted without scanning. Future arbitrary PDFs still require the scanner. Image submissions retain decoding/re-encoding validation.

The generator supports `--approved-v1`. PDF metadata may change on regeneration; never overwrite the registered immutable version. The committed asset is the exact uploaded version. Create a newly approved version for changes.

## Deployment and verification

Runtime commit `13d5f8bf60cba2332d78a2dfa88ab83143de4769` deployed READY as `dpl_Gso8jrTRbHnWrepAxEw1R4EgiP7W`, aliased to https://utr-farabi.vercel.app. Verification CI `42513272680` and complete isolated workflow CI `42513272697` passed. Fifty unit/database tests include 72-hour inside/outside boundaries for revision and zero, and acceptance of two alternatives with rejection of a third.

Hosted HTTP/browser acceptance passed SSR login, pending-account administration denial, reaching the live academic authorization gate, exact approved-form byte hash through authenticated private Storage, profile rendering and private-form denial after logout. The unprivileged temporary probe has no academic fixtures. Cleanup initially encountered the intentional restrictive profile foreign key; the probe was removed in a guarded transaction and the script corrected to remove only its own roles/profile before its Auth user. The full academic grading workflow remains tested on isolated real Supabase, not by inserting fictional grades into production.

The first administrator's existing academic and technical role grants remain unchanged. No SMTP, PDF scanner, paid service or new institutional engagement/certificate rules were activated by this release.
