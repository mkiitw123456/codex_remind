import {timingSafeEqual, randomUUID} from 'node:crypto';
export function authorized(header, secret) {
  if(!secret || secret.length<24 || typeof header!=='string') return false;
  const a=Buffer.from(header),b=Buffer.from(`Bearer ${secret}`);
  return a.length===b.length && timingSafeEqual(a,b);
}
export function makeEvent(body){
  if(!body || typeof body.title!=='string' || !body.title.trim() || body.title.length>120) throw new Error('項目名稱須為 1–120 字');
  if(!['completed','attention','turn-complete'].includes(body.kind)) throw new Error('無效事件類型');
  if(body.id!==undefined && (typeof body.id!=='string'|| !/^[\w:-]{1,150}$/.test(body.id))) throw new Error('無效事件 ID');
  return {id:body.id||randomUUID(), title:body.title.trim(),kind:body.kind,createdAt:Date.now()};
}
export async function redis(command){
  const r=await fetch(process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error('Storage unavailable');
  const data=await r.json(); if(data.error) throw new Error('Storage command failed'); return data.result;
}
