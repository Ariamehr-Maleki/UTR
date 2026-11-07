import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {liveEnabled} from '@/lib/config';
export function scannerClient(){if(!liveEnabled()||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error('File safety service unavailable');return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}
