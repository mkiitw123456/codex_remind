import test from 'node:test';
import assert from 'node:assert/strict';
import {clientConfigPath,validateClientConfig} from '../lib/client-config.js';
import {notificationPrompt} from '../public/prompt.js';
import {readFile} from 'node:fs/promises';

test('Portable settings resolve on all supported systems without repository paths',()=>{
  assert.equal(clientConfigPath({platform:'win32',env:{APPDATA:'C:\\Users\\Jane\\AppData\\Roaming'},home:'C:\\Users\\Jane'}),'C:\\Users\\Jane\\AppData\\Roaming\\CodexRadio\\connection.json');
  assert.equal(clientConfigPath({platform:'win32',env:{},home:'D:\\Users\\Jane'}),'D:\\Users\\Jane\\AppData\\Roaming\\CodexRadio\\connection.json');
  assert.equal(clientConfigPath({platform:'darwin',env:{},home:'/Users/jane'}),'/Users/jane/Library/Application Support/CodexRadio/connection.json');
  assert.equal(clientConfigPath({platform:'linux',env:{XDG_CONFIG_HOME:'/data/config'},home:'/home/jane'}),'/data/config/codex-radio/connection.json');
  assert.equal(clientConfigPath({platform:'linux',env:{XDG_CONFIG_HOME:'relative'},home:'/home/jane'}),'/home/jane/.config/codex-radio/connection.json');
});

test('Private config fails closed on wrong destination, placeholders and header injection',()=>{
  const valid={siteUrl:'https://codex-remind.vercel.app',notifyToken:'a'.repeat(64)};
  assert.deepEqual(validateClientConfig(valid),valid);
  assert.throws(()=>validateClientConfig({...valid,siteUrl:'https://other.example'}));
  assert.throws(()=>validateClientConfig({...valid,notifyToken:''}));
  assert.throws(()=>validateClientConfig({...valid,notifyToken:'a'.repeat(32)+'\r\n'}));
});

test('Public prompt and template contain no device paths or embedded authorization',async()=>{
  assert.ok(!notificationPrompt.includes('D:/codex_remind'));
  assert.ok(notificationPrompt.includes('Invoke-RestMethod'));
  assert.ok(notificationPrompt.includes('urllib.request'));
  assert.ok(notificationPrompt.includes('notifyToken'));
  const template=JSON.parse(await readFile(new URL('../public/connection.example.json',import.meta.url),'utf8'));
  assert.equal(template.notifyToken,'');
});
