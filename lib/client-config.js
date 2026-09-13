import {posix, win32} from 'node:path';
import {homedir} from 'node:os';
import {readFile} from 'node:fs/promises';

export function clientConfigPath({platform=process.platform,env=process.env,home=homedir()}={}) {
  if(platform==='win32') return win32.join(env.APPDATA||win32.join(home,'AppData','Roaming'),'CodexRadio','connection.json');
  if(platform==='darwin') return posix.join(home,'Library','Application Support','CodexRadio','connection.json');
  return posix.join(env.XDG_CONFIG_HOME && posix.isAbsolute(env.XDG_CONFIG_HOME)?env.XDG_CONFIG_HOME:posix.join(home,'.config'),'codex-radio','connection.json');
}

export function validateClientConfig(value) {
  if(!value || value.siteUrl!=='https://codex-remind.vercel.app' || typeof value.notifyToken!=='string' || value.notifyToken.length<24 || /[\r\n]/.test(value.notifyToken)) {
    throw new Error('私人連線檔的網站網址或發送密鑰無效');
  }
  return {siteUrl:value.siteUrl,notifyToken:value.notifyToken,...(typeof value.projectName==='string'?{projectName:value.projectName}:{})};
}

export async function readClientConfig() {
  try {return validateClientConfig(JSON.parse(await readFile(clientConfigPath(),'utf8')));}
  catch(error){
    if(error.code!=='ENOENT') throw error;
    // Keep existing optional hooks and old installations working.
    return validateClientConfig(JSON.parse(await readFile(new URL('../scripts/notify.local.json',import.meta.url),'utf8')));
  }
}
