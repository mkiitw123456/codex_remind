export const notificationPrompt = `請在這個任務中使用我的 Codex Radio 通知網站：https://codex-remind.vercel.app

這是跨電腦的 HTTP 通知流程，不需要 clone 儲存庫、安裝套件或使用某個固定路徑的發送程式。

【這台電腦的連線設定】
依目前執行環境尋找私人 JSON 設定檔，不能把下列環境變數名稱當成字面路徑：
- Windows：%APPDATA%/CodexRadio/connection.json；APPDATA 不存在時，使用使用者目錄下 AppData/Roaming/CodexRadio/connection.json。
- macOS：使用者目錄下 Library/Application Support/CodexRadio/connection.json。
- Linux：$XDG_CONFIG_HOME/codex-radio/connection.json；XDG_CONFIG_HOME 未設為絕對路徑時，使用 ~/.config/codex-radio/connection.json。

JSON 結構為 {"siteUrl":"https://codex-remind.vercel.app","notifyToken":"私人發送密鑰"}。
若檔案不存在，請我提供「通知連線設定.private.json」檔案，暫時繼續可獨立完成的工作，不要假裝已啟用通知。我提供檔案後，先驗證 siteUrl 等於上述網站且 notifyToken 是至少 24 字元、沒有換行的字串，才存入這台電腦對應的位置。Linux/macOS 設定目錄權限 700、檔案 600；Windows 限制為目前使用者可讀寫。不要覆寫不同網站的既有設定，不要將檔案存入 Git 儲存庫。
不要把密鑰或私人檔案內容顯示在對話、log、指令參數或公開檔案裡。只在本機程式記憶體中讀取 notifyToken，用於下列網站的 Authorization 標頭。不需要 OpenAI API Key，也不能用觀看密鑰代替發送密鑰。

【何時通知】
1. 項目確實完成且驗證通過：在最後回覆前發送 kind="completed"，title 為簡短項目名稱。
2. 需要我確認、補資料、選方案、登入、授權或手動操作：先在對話提出清楚的問題，在等待前發送 kind="attention"，title 為「項目名稱：需要確認的事項」。有可獨立完成的工作就繼續。提醒不代表獲得我的同意。
3. 單純回覆結束不算項目完成。同一完成項目或待確認事項只通知一次，不反覆提醒相同的等待。

【直接發送 HTTP】
POST https://codex-remind.vercel.app/api/events
標頭：Content-Type: application/json；Authorization: Bearer <從本機設定讀取的 notifyToken>
UTF-8 JSON：{"id":"每則通知新產生的 UUID","kind":"completed 或 attention","title":"1–120 字的簡短文字"}
依這台電腦現有工具使用 PowerShell Invoke-RestMethod、Python 3 標準函式庫 urllib.request 或 Node.js fetch。用 JSON 序列化及參數傳遞，不要把通知文字串接成 shell 指令。PowerShell 請明確用 UTF-8 位元組送出 JSON。
只發送項目名稱及必要確認摘要，不上傳完整對話、程式碼或任何密鑰。拒絕 HTTP 重新導向，避免將 Authorization 送往其他網站；每次請求逾時 10 秒。網路錯誤、408、429 或 5xx 可在短暫退避後重試，最多 3 次；重試保留同一個 UUID。400/401/403 等錯誤不要重試，請直接告知我需修正的原因。
只有 HTTP 2xx 且回應 JSON 的 ok 為 true 才算成功；duplicate=true 也算已成功送達。這表示網站已接收，不保證休眠中的裝置立刻發聲。
若執行環境無法存取本機檔案或網路，直接告知我限制，不要宣稱已通知。通知失敗不應阻止原本任務；如實報告後繼續處理。`;
