import {readClientConfig} from '../lib/client-config.js';
import {createHash,randomUUID} from 'node:crypto';
let hook=false;
try{
  const config=await readClientConfig();
  let event;
  if(['--complete','--attention'].includes(process.argv[2]))event={kind:process.argv[2]==='--complete'?'completed':'attention',title:process.argv[3],id:randomUUID()};
  else{
    hook=true;let raw='';for await(const part of process.stdin){raw+=part;if(raw.length>1000000)throw new Error('Hook input too large');}
    const payload=JSON.parse(raw);if(payload.hook_event_name!=='Stop')process.exit(0);
    event={kind:'turn-complete',title:config.projectName||'Codex 工作',id:createHash('sha256').update(`${payload.session_id}:${payload.turn_id||randomUUID()}`).digest('hex')};
  }
  const url=new URL('/api/events',config.siteUrl);if(url.protocol!=='https:'&&url.hostname!=='127.0.0.1')throw new Error('Use an HTTPS site URL');
  for(let attempt=0;attempt<3;attempt++){
    try{const r=await fetch(url,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${config.notifyToken}`,'Content-Type':'application/json'},body:JSON.stringify(event),signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error(`HTTP ${r.status}`);if((await r.json()).ok!==true)throw new Error('網站未確認收件');if(hook)console.log('{}');else console.log('通知已送出');break;}
    catch(err){if(attempt===2)throw err;await new Promise(r=>setTimeout(r,500*(attempt+1)));}
  }
}catch(err){if(hook)console.log(JSON.stringify({systemMessage:`Codex Radio 通知傳送失敗：${err.message}`}));else{console.error(`通知傳送失敗：${err.message}`);process.exitCode=1;}}
