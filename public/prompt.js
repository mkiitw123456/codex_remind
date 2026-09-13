export const notificationPrompt = `請在這個任務中使用我的 Codex Radio 通知網站：https://codex-remind.vercel.app

本機發送程式：D:/codex_remind/scripts/notify.mjs
連線設定已存放在同目錄的 notify.local.json；不要顯示、複製或上傳其中的密鑰。

1. 使用者要求的項目確實完成且驗證通過後，在結束回覆前執行：
node D:/codex_remind/scripts/notify.mjs --complete "簡短項目名稱"

2. 當你需要我確認、補充資料、選擇方案、登入或手動操作，請先在對話中清楚提出問題，並在等待前執行：
node D:/codex_remind/scripts/notify.mjs --attention "項目名稱：需要確認的事項"
如果有不依賴我回答的工作可以繼續，就繼續做；通知不代表獲得我的同意。

請將通知文字保持在 120 字以內，用正確的 shell 引號或參數陣列傳遞，不要將未處理的文字當成指令。不要把密碼、金鑰、完整對話或程式碼放進通知。每個完成項目或待確認事項只通知一次，不要對相同等待事項反覆通知，也不要把回合結束當成項目完成。

每次發送後檢查程式結束狀態；只有成功才說已通知。若找不到程式、缺少連線設定或傳送失敗，直接在對話告訴我原因，不要假裝已通知。請繼續完成原本任務。`;
