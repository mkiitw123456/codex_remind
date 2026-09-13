import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../api/events.js';
try{process.loadEnvFile('.env.local');}catch{}
const files={'/':'index.html','/style.css':'style.css','/app.js':'app.js','/youtube.js':'youtube.js','/prompt.js':'prompt.js','/connection.example.json':'connection.example.json'};
http.createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;try{if(path==='/api/events'){let data='';for await(const chunk of req){data+=chunk;if(data.length>8192){res.writeHead(413);return res.end();}}req.body=data;res.status=n=>{res.statusCode=n;return res;};res.json=x=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(x));};return await handler(req,res);}if(!files[path]){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.json')?'application/json':'text/html; charset=utf-8');res.end(await readFile(new URL('../public/'+files[path],import.meta.url)));}catch{res.writeHead(500);res.end('Server error');}}).listen(4173,'127.0.0.1',()=>console.log('Codex Radio: http://127.0.0.1:4173'));
