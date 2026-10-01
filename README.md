# Thermal Assistant｜企業內部工程 AI 助理（概念作品）

工程師用一句話描述散熱情境，AI 估算主機板各元件的溫度，並且清楚標出：

- **結論**：安全 / 需要注意 / 過熱風險
- **依據**：溫度分布圖、各元件的溫度與餘裕
- **條件來源**：哪些是使用者提供的、哪些是 AI 自行假設的（附理由）
- **可修改**：點一下條件就能改掉，重新分析
- **可信度**：AI 自己假設越多，可信度越低

設計主張：**AI 可以很聰明，但工程師要看得懂、能檢查、敢相信，才會真的拿去用。**

> 目前的 AI 是模擬資料（`src/data/mockAgent.js`），散熱模型是簡化版，只用於作品展示。

## 執行方式

```bash
npm install
npm run dev
```

打開終端機顯示的網址（通常是 http://localhost:5173）。

## 專案結構

```
src/
├─ App.jsx                 整個對話的流程與狀態
├─ data/mockAgent.js       模擬的 AI 服務（之後換成真 API）
├─ styles/tokens.css       設計系統：顏色、字級、間距、圓角
├─ index.css               所有元件的樣式（只用 tokens，不寫死數值）
└─ components/
   ├─ ChatInput.jsx        輸入框                ← 任務 1
   ├─ AssumptionChips.jsx  可修改的條件標籤       ← 任務 2
   ├─ MessageList.jsx      對話列表
   ├─ ResultCard.jsx       分析結果卡片
   ├─ Heatmap.jsx          溫度分布圖（SVG）
   ├─ ProgressSteps.jsx    AI 分析進度
   └─ SuggestedPrompts.jsx 空狀態的範例問題
```

## 開發進度

- [x] 階段 1：專案骨架、設計系統、結果卡片、模擬 AI
- [ ] 任務 1：輸入框（`ChatInput.jsx`）
- [ ] 任務 2：修改條件並重新分析（`AssumptionChips.jsx`）
- [ ] 階段 3：串接真的 AI API
- [ ] 階段 4：部署上線，寫成作品集案例

## 可以試試的輸入

- `這張主機板在 35°C 環境、滿載、風速 2 m/s 下，會不會過熱？`（條件完整）
- `夏天機房比較熱，這張板子撐得住嗎？`（AI 會自己推測條件）
- `45°C、滿載、風扇故障只剩 0.8 m/s`（過熱）
- `測試錯誤`（錯誤狀態）
