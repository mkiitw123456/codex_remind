export function parseYouTube(value){
  let url;try{url=new URL(value);}catch{throw new Error('請貼上完整的 YouTube 影片或播放清單網址');}
  if(!['https:','http:'].includes(url.protocol)||!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(url.hostname)) throw new Error('請使用 YouTube 網址');
  const list=url.searchParams.get('list');
  const video=url.hostname==='youtu.be'?url.pathname.slice(1):url.searchParams.get('v')||(/^\/(shorts|embed|live)\//.test(url.pathname)?url.pathname.split('/')[2]:null);
  if(list && /^[a-zA-Z0-9_-]{10,150}$/.test(list))return {list};
  if(video && /^[a-zA-Z0-9_-]{11}$/.test(video))return {video};
  throw new Error('網址中找不到有效的影片或播放清單');
}
