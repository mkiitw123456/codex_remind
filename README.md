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
3. 可在 Vercel Storage 連接 Upstash Redis 免費資料庫；整合會自動提供 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`，程式已支援。也可自行建立 Upstash Redis，改用下表的 REST URL 和 REST Token。
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

## 跨電腦通知（建議流程）

網站按「複製通知指令」，貼到 Codex 任務。Windows、macOS、Linux 都用相同文字；Codex 使用所在電腦的 PowerShell、Python 3 或 Node 直接呼叫網站 API，不依賴儲存庫、固定磁碟或本機發送程式。

### 每台新電腦設定一次

1. 取得管理者提供的私人連線檔「通知連線設定.private.json」，提供給新電腦上的 Codex。不要把密鑰貼到公開對話或提交 Git。
2. 貼上網站的通知指令。Codex 依指令驗證檔案後，存入以下使用者設定目錄。
3. 之後每個任務只需貼相同指令。你現在這台電腦已完成遷移。

| 系統 | 私人設定位置 |
| --- | --- |
| Windows | APPDATA/CodexRadio/connection.json（APPDATA 是環境變數，通常位於使用者的 AppData/Roaming） |
| macOS | ~/Library/Application Support/CodexRadio/connection.json |
| Linux | XDG_CONFIG_HOME/codex-radio/connection.json；未設定絕對路徑時使用 ~/.config/codex-radio/connection.json |

私人 JSON 只有 siteUrl 與 notifyToken。siteUrl 必須為 https://codex-remind.vercel.app；notifyToken 是網站 NOTIFY_TOKEN，至少 24 字元且無換行。網站提供的 connection.example.json 只是空白範本，不含任何密鑰。觀看密鑰不能代替發送密鑰。檔案遺失時須重新取得；瀏覽器不會回傳發送密鑰。

私人連線檔目前使用同一個發送密鑰，只交給你信任的電腦；若外洩需在 Vercel 更新 NOTIFY_TOKEN 並重新部署，再更新所有發送電腦的私人設定。這一版沒有個別裝置的撤銷功能。

### 通知規則與 API

- 項目確實完成、驗證通過：completed。
- 需要你確認、補資料、選方案或手動操作：attention。
- Codex 必須先在對話說明問題，通知不構成你的授權；同一等待事項不重複通知。
- POST https://codex-remind.vercel.app/api/events；Authorization 使用 Bearer 加本機讀取的 notifyToken；Content-Type 為 application/json。
- UTF-8 JSON 的 id 是新 UUID，kind 為上述類型，title 是 1–120 字。重試保持相同 UUID。
- 拒絕重新導向。每次逾時 10 秒；只針對暫時性錯誤最多重試 3 次，401/403 不重試。HTTP 2xx 且 JSON ok=true 才算收件成功。
- 通知指令是給可操作本機檔案／網路的 Codex 使用；純聊天或隔離雲端環境必須另外配置該執行環境的檔案與權限，不能宣稱自動取得你電腦的設定。

### 舊腳本與 Hook 相容

既有 scripts/notify.mjs 仍可用，優先讀取新的使用者設定，不存在時才讀 scripts/notify.local.json。它是選用工具；新的跨電腦指令不需要它。

hooks.example.json 仍為選用的回合結束提醒，不會自動安裝。Stop 僅表示回覆結束，不等同項目成功。日常使用複製指令即可，不需要 Hook。

## 行為與限制

- 網頁需開著；系統休眠、鎖屏與背景節流會延後通知，這不是離線推播服務。
- 聲音需先點擊啟用；中文語音依瀏覽器與系統安裝的聲音而定。
- YouTube 可能拒絕嵌入、要求登入或阻止自動播放；畫面會提示。無法繞過影片擁有者或 YouTube 的限制。
- 不是同步聽歌房；通知共用，影片及播放進度各自獨立。
- 5 秒輪詢每台持續開啟的裝置約每分鐘 12 次請求，實際費用／額度依 Vercel 與 Upstash 帳戶方案。
- 此專案設定使用 Upstash Free（建立時每月 500,000 次指令）。不自動升級付費；接近額度時可關閉不用的網頁或調長輪詢間隔。
- 目前為單一共用頻道。持有觀看密鑰的人可看通知名稱，發送密鑰可發通知。對外大型服務應增加帳號／房間隔離與流量限制。

## 驗證

`npm test`：網址解析、防冒牌網址、API 權限、資料驗證、模擬共用儲存與去重。
`npm run build`：產生靜態檔案。正式 Redis、電腦版 Hook 和跨裝置通知需完成雲端設定後實測。

官方參考：[Codex Hooks](https://learn.chatgpt.com/docs/hooks)、[YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)、[Vercel Functions](https://vercel.com/docs/functions)、[Upstash REST](https://upstash.com/docs/redis/features/restapi)。
