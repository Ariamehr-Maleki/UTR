import {it,expect,afterEach,vi} from 'vitest';
import {liveEnabled} from '../src/lib/config';
afterEach(()=>vi.unstubAllEnvs());
it('fails closed without explicit activation',()=>{vi.stubEnv('UTR_LIVE_ENABLED','false');expect(liveEnabled()).toBe(false)});
it('blocks production database from previews even with activation',()=>{vi.stubEnv('UTR_LIVE_ENABLED','true');vi.stubEnv('VERCEL_ENV','preview');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://spqtwgyxzdythfmyzvyh.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','public');vi.stubEnv('UTR_PREVIEW_PROJECT_REF','spqtwgyxzdythfmyzvyh');expect(liveEnabled()).toBe(false)});
