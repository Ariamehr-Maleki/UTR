import {liveEnabled} from './config';
import {database} from './supabase/server';
export type RecordItem={id:string;title:string;description:string;starts_at?:string;ends_at?:string;summary_deadline?:string;kind?:string;external_url?:string;club_approved?:boolean;venue?:string;status?:string};
export async function publicRecords(table:'events'|'content',kind?:string):Promise<RecordItem[]>{if(!liveEnabled())return [];const db=await database();let q=db.from(table).select('*').eq('status','published');if(kind)q=q.eq('kind',kind);const {data,error}=await q.order(table==='events'?'starts_at':'created_at',{ascending:table==='events'});if(error)throw new Error('دریافت اطلاعات ممکن نیست. دوباره تلاش کنید.');return data||[];}
