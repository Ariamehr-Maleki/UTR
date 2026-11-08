# Decisions and release gates

- Exact Persian font: user replied “IDK”; not identifiable with confidence. Temporary Vazirmatn.
- Weekly deadline: explicitly approved by the user: Saturday–Friday, Friday 23:59:59 Asia/Tehran. Store explicit event deadline and policy snapshot; production event publication requires approval.
- Revision grace, late-zero referral grace, alternative-referral maximum, review SLA, reversal unlock and attendance exceptions: unresolved. Null configuration blocks exceptional paths; no guessed institutional policy.
- Positive credit remains locked even after reversal until an explicit approved policy and audited correction; appeals never unlock automatically.
- Points and public leaderboards disabled until approved values and consent rules. Certificates disabled until eligibility rules approved.
- User deferred activation email: signup may use Supabase email auto-confirmation, but membership stays pending. Email ownership is NOT established by auto-confirmation. Recovery email remains separately disabled until delivery is verified.
- Supabase management credentials unavailable at initial inspection. Public key is not schema authority. Never reuse earlier conversation passwords.
- Previews fail closed against production Supabase; a distinct staging project is required for interactive authenticated previews.
- Supplied emblem used unchanged; no fabricated official logo.

- Hosted public schema was inspected and empty. The prepared SQL editor draft was NOT run; browser tooling later timed out. On 2026-11-08 the connected Supabase management plugin applied the tested fourteen-migration release successfully; the earlier editor draft remains obsolete.
- Local test evidence does not certify hosted Auth, Storage or SMTP. Both live/signup flags remain false in Vercel.
- Retention duration, institutional contact details and official club form asset remain institution-supplied inputs. No invented contact or form is published.

- Hosted verification: 27 public tables, all with RLS enabled; summaries/forms buckets private; no Auth users or demo academic records created. Advisory review identified two internal trigger functions with unnecessary authenticated EXECUTE grants; migration 15 revokes those grants. Remaining SECURITY DEFINER RPC advisories are intentionally exposed guarded workflows/read predicates, not blanket database write grants.

- Hosted rollback-only smoke test passed on 2026-11-08: attendance requirement, unauthorized role escalation, canonical-submission retry, cross-student/instructor isolation, zero re-referral, positive referral/file lock, assessment idempotency, and technical/academic separation. No fixture persists. This is database verification, not live email/HTTP Storage verification.
- Creating UTR Staging in the user-approved UTR organization was rejected by Supabase: account-level maximum of two active Free projects already reached. No project was paused/deleted and no paid upgrade was purchased.

- User deferred activation-email setup on 2026-11-08. SMTP is no longer a blocker for completing non-email implementation/testing. No student status or privileged role is auto-approved by this deferral; public signup and password recovery remain disabled until an explicit supported account-provisioning path is configured.

- 2026-11-08: User requested a full visual redesign and authorized importing official Farabi event archives, journals and library content. 1405–1406 remains coming soon. Historical editorial records are separate from operational academic events; importing them never asserts attendance, club eligibility or credit. Public previews may use the reviewed public-content snapshot while production remains database-managed. Authentic poster colors are retained; the interface keeps the blue/cyan institutional palette.

## Account activation verification — 2026-11-08

Authenticated CLI access was available. Applied only four reviewed Auth settings: production site URL, exact callback URL, minimum password length 12, and email confirmations disabled per user direction. Real hosted auth-only smoke passed signup/session, pending membership, login/logout, self-escalation denial, other-profile isolation and private-storage denial. Temporary labeled accounts were removed; no academic records were created. This does not verify successful private uploads or the complete hosted grading flow. Designated first technical administrator: aiariamehr@gmail.com; role bootstrap still requires independent ownership verification, not an auto-confirmed email. No academic authority is implied.

Account-only activation is now deployed: UTR_ACCOUNTS_ENABLED=true and UTR_SIGNUP_ENABLED=true for production; UTR_LIVE_ENABLED remains false. Automatic approval review rejected enabling the broad live gate before full hosted academic verification; the new scoped gate permits only authentication/profile/logout and is regression-tested to keep academic mutations and files blocked. Vercel CLI requires a separate device login for direct confidential transfer from the local authenticated Supabase CLI; the initial device authorization expired without completion. Local Docker engine did not become available, and the separate hosted free staging project remains quota-blocked.

## Administrator bootstrap — 2026-11-08

The requester returned the UUID visible inside their authenticated profile; the hosted Auth account matched their previously designated email. They separately confirmed personal responsibility for academic administration. The first technical superadmin and first academic admin were initialized in one guarded transaction with independent audit reasons and advisory locks. Readback under the authenticated database role confirmed technical_admin=true, academic_admin=true and student=false. No student status was inferred and no other accounts were modified. Academic runtime activation remains gated pending end-to-end acceptance.
