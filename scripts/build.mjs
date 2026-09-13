import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','youtube.js','prompt.js']) await copyFile(`public/${file}`,`dist/${file}`);
console.log('Built static player. Vercel discovers api/events.js automatically.');
