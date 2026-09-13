import {authorized,makeEvent,redis} from '../lib/events.js';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
  if(!(process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL)||!(process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN)||!(process.env.NOTIFY_TOKEN?.length>=24)||!(process.env.VIEW_TOKEN?.length>=24)) return res.status(503).json({error:'尚未設定通知服務，請完成 Vercel 環境變數設定'});
  if(!authorized(req.headers.authorization,process.env[req.method==='GET'?'VIEW_TOKEN':'NOTIFY_TOKEN'])) return res.status(401).json({error:'連線密鑰不正確'});
  try{
    if(req.method==='GET') return res.status(200).json({events:(await redis(['LRANGE','codex-radio:events',0,99])||[]).map(x=>JSON.parse(x))});
    let event;try {event=makeEvent(typeof req.body==='string'?JSON.parse(req.body):req.body);}catch(e){return res.status(400).json({error:e.message});}
    // Deduplication and insertion form one atomic transaction, safe across serverless instances.
    const script="if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 604800) then redis.call('LPUSH', KEYS[1], ARGV[1]); redis.call('LTRIM', KEYS[1], 0, 99); redis.call('EXPIRE', KEYS[1], 604800); return 1 else return 0 end";
    const inserted=await redis(['EVAL',script,2,'codex-radio:events',`codex-radio:dedup:${event.id}`,JSON.stringify(event)]);
    return res.status(200).json({ok:true,duplicate:!inserted});
  }catch{return res.status(502).json({error:'通知服務暫時無法連線，稍後會自動重試'});}
}
