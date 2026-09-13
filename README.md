# Codex Radio

簡約的 YouTube 播放空間，接收 Codex 電腦版的工作回音。原生 HTML/CSS/JS、Vercel Functions、Upstash Redis。無前端框架、無 npm 套件依賴。

## 功能

- 貼上 YouTube 影片／播放清單；使用官方嵌入播放器，播放控制由 YouTube 提供。
- 每台裝置各自播放；使用相同觀看密鑰的裝置讀取共同通知。
- 每 5 秒檢查；提示音、可選中文語音、最新消息及歷史列表。
- 每次新開／重新整理分頁先載入歷史，不播報舊消息；持續開啟的分頁斷線重連後會補收新消息。
- 觀看密鑰與發送密鑰分離；密鑰不寫入前端或 Git。事件 ID 去重，最多保留 100 則、7 天。

## 本機

需要 Node.js 22 以上。

```powershell
cd D:/codex_remind
npm run dev
```

開啟 http://127.0.0.1:4173 。未設定儲存時，播放器與試聽可用，API 會明確顯示尚未設定。
本機通知測試可將 `.env.example` 複製為 `.env.local` 填入後重啟伺服器。

## Git → Vercel

1. 在 Vercel 匯入 `mkiitw123456/codex_remind`，選擇 `main`。
2. Framework Preset 選 Other。儲存庫的 `vercel.json` 已設定 `npm run build` 及 `dist` 輸出目錄；根目錄的 `api/events.js` 是 Vercel Function。
3. 建立 Upstash Redis 資料庫，取得 REST URL 和 REST Token。
4. 在 Vercel Project → Settings → Environment Variables 設定以下四個值。不要加任何公開前端前綴。

| 變數 | 用途 |
| --- | --- |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST Token |
| NOTIFY_TOKEN | 發送通知用，至少 24 字元隨機密鑰 |
| VIEW_TOKEN | 觀看用，另一組至少 24 字元隨機密鑰 |

可用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 產生一組；執行兩次並分別保存。只將 VIEW_TOKEN 分享給觀看者。

5. Deploy；後續 push 到 main 自動部署。修改環境變數後重新部署。
6. 打開正式網址 → 連線設定 → 填入 VIEW_TOKEN → 點啟用聲音。

## Codex 電腦版串接

日常使用：在網站按「複製通知指令」，貼到新的 Codex 任務即可。它會要求 Codex 在項目完成時發出完成通知，需要你確認／補資料／登入時發出待確認通知。這是透過任務指令呼叫本機程式，需要下列一次性連線設定；不需要安裝 Hook。換到另一台電腦時，需先配置該台的程式路徑與連線設定。

1. 複製 `scripts/notify.example.json` 為 `scripts/notify.local.json`（Git 已忽略）。填入正式 `siteUrl`、NOTIFY_TOKEN 及想顯示的 `projectName`。
2. 先測試明確的完成通知：

```powershell
node D:/codex_remind/scripts/notify.mjs --complete "首頁製作"
```

也可測試待確認通知：`node D:/codex_remind/scripts/notify.mjs --attention "首頁：請確認配色"`。

以下為選用功能，日常複製指令流程不需要：

3. 自動回合通知：將 `hooks.example.json` 的 Stop handler 合併到使用者的 `~/.codex/hooks.json`；若只想套用單一專案則合併到該專案 `.codex/hooks.json`。不要覆蓋既有 hooks。範例使用此電腦的 D 槽絕對路徑；搬動專案後須同步修改。
4. 依 Codex 提示審閱並信任這個 Hook。官方文件說明非受管 Hook 必須先經信任；CLI 可用 `/hooks` 審閱。若目前電腦版沒有審閱介面，需透過相同設定目錄的 CLI 審閱，或先使用完成指令。重新開啟工作階段並做一次實際回合驗證。

Stop 表示本次回覆結束，不代表所有需求都已成功。因此 Hook 自動顯示「本次回覆完成」；`--complete` 才顯示「項目已完成」。你可以在工作專案的 AGENTS.md 加入這段，讓 Codex 完成並驗證工作後主動呼叫：

> 完成使用者要求且驗證通過後，執行 `node D:/codex_remind/scripts/notify.mjs --complete "簡短項目名稱"`。等待澄清、遇到阻礙或工作未完成時不要發送完成通知。發送失敗時如實說明。

兩者可擇一；同時使用會有一則完成通知及一則回合通知。自動 Hook 不上傳對話或程式碼，只傳設定的專案名稱、事件類型、雜湊識別碼；不讀取 transcript。失敗最多重試三次，重試使用相同 ID，持續失敗會顯示警告，不冒充已送達。

## 行為與限制

- 網頁需開著；系統休眠、鎖屏與背景節流會延後通知，這不是離線推播服務。
- 聲音需先點擊啟用；中文語音依瀏覽器與系統安裝的聲音而定。
- YouTube 可能拒絕嵌入、要求登入或阻止自動播放；畫面會提示。無法繞過影片擁有者或 YouTube 的限制。
- 不是同步聽歌房；通知共用，影片及播放進度各自獨立。
- 5 秒輪詢每台持續開啟的裝置約每分鐘 12 次請求，實際費用／額度依 Vercel 與 Upstash 帳戶方案。
- 目前為單一共用頻道。持有觀看密鑰的人可看通知名稱，發送密鑰可發通知。對外大型服務應增加帳號／房間隔離與流量限制。

## 驗證

`npm test`：網址解析、防冒牌網址、API 權限、資料驗證、模擬共用儲存與去重。
`npm run build`：產生靜態檔案。正式 Redis、電腦版 Hook 和跨裝置通知需完成雲端設定後實測。

官方參考：[Codex Hooks](https://learn.chatgpt.com/docs/hooks)、[YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)、[Vercel Functions](https://vercel.com/docs/functions)、[Upstash REST](https://upstash.com/docs/redis/features/restapi)。
