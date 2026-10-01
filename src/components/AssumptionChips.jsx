// ═════════════════════════════════════════════════════════════
// 任務 2：讓條件標籤可以修改，並重新分析
//
// 這是整個作品的設計核心：AI 做了假設，但「人」可以隨時改掉它。
// 你會練到：多個狀態、條件渲染、不可變更新（immutable update）、callback props
//
// 完成後的樣子：
//   點「風速 2 m/s」→ 變成一個小輸入框 → 改成 1 → 按「重新分析」
//   → 對話裡出現「修改條件後重新分析：風速 2 → 1 m/s」和新的結果
// ═════════════════════════════════════════════════════════════

// TODO 2-1：從 react 引入 useState
import { useState } from 'react'
export default function AssumptionChips({ assumptions, onRerun, disabled }) {
  // assumptions 長這樣（每個條件都有 label、value、unit、source……）：
  // {
  //   ambient: { label: '環境溫度', value: 35, unit: '°C', min: 0, max: 60, source: 'user' },
  //   load:    { label: '負載',     value: 100, unit: '%', ... source: 'ai' },
  //   airflow: { label: '風速',     value: 2, unit: 'm/s', ... source: 'ai' },
  // }

  // TODO 2-2：建立兩個狀態
  //   editingKey：現在正在修改哪一個條件（'ambient'、'load'、'airflow'），沒在改的時候是 null
  //   draft：輸入框裡暫時打的數字（字串）
  //   完成後，把下面這兩行刪掉 ↓
  const [editingKey, setEditingKey] = useState(null)
  const [draft, setDraft] = useState('')

  function startEdit(key) {
    // TODO 2-3：開始修改某個條件
    //   (1) 把 editingKey 設成 key
    //   (2) 把 draft 設成目前的值（記得轉成字串：String(assumptions[key].value)）
    setEditingKey(key)
    setDraft(String(assumptions[key].value))
  }

  function cancel() {
    // TODO 2-4：取消修改（把 editingKey 設回 null）
    setEditingKey(null)
  }

  function confirm(event) {
    event.preventDefault()
    // TODO 2-5：確認修改，照這五步：
    //   (1) 取出正在改的條件：const item = assumptions[editingKey]
    //   (2) 把 draft 轉成數字：const value = Number(draft)
    //   (3) 防呆：如果不是數字（Number.isNaN），或超出 item.min 到 item.max，就 return
    //   (4) 如果數字沒變，就 cancel() 然後 return
    //   (5) 做出「新的」條件物件，然後交給 onRerun：
    //
    //       const next = {
    //         ...assumptions,
    //         [editingKey]: { ...item, value, source: 'user' },
    //       }
    //       setEditingKey(null)
    //       onRerun(next)
    //
    //   ⚠️ 為什麼要用 ...（展開）做一個新物件，而不是直接改 assumptions[editingKey].value？
    //   因為 React 是靠「物件換了沒有」來判斷要不要重畫畫面。直接改舊物件，畫面可能不會更新，
    //   而且舊的那張分析卡片也會被偷偷改掉。這是 React 面試很常考的觀念。
    //
    //   另外注意 source 改成 'user'：使用者改過的值，就不再是「AI 假設」了。
    const item = assumptions[editingKey]
const value = Number(draft)
if (Number.isNaN(value) || value < item.min || value > item.max) return
if (value === item.value) {
  cancel()
  return
}

const next = {
  ...assumptions,
  [editingKey]: { ...item, value, source: 'user' },
}
setEditingKey(null)
onRerun(next)
  }

  return (
    <div className="chips">
      {Object.entries(assumptions).map(([key, a]) =>
        key === editingKey ? (
          // 修改中：顯示小輸入框（這段畫面已經幫你寫好了）
          <form key={key} className="chip-editor" onSubmit={confirm}>
            <label htmlFor={`edit-${key}`}>{a.label}</label>
            <input
              id={`edit-${key}`}
              type="number"
              value={draft}
              min={a.min}
              max={a.max}
              step={a.step}
              autoFocus
              // TODO 2-6：打字時更新 draft
              //   提示：onChange={(event) => setDraft(event.target.value)}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && cancel()}
            />
            <span>{a.unit}</span>
            <button type="submit" className="btn btn--primary btn--small">
              重新分析
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={cancel}>
              取消
            </button>
          </form>
        ) : (
          // 平常：顯示標籤。AI 假設的用虛線（chip--ai），使用者提供的用實線
          <button
            key={key}
            type="button"
            className={`chip ${a.source === 'ai' ? 'chip--ai' : ''}`}
            onClick={() => startEdit(key)}
            disabled={disabled}
            title={a.reason}
          >
            <span>{a.label}</span>
            <span className="chip__value">
              {a.value} {a.unit}
            </span>
            <span className="chip__source">{a.source === 'ai' ? 'AI 假設' : '你提供'}</span>
          </button>
        ),
      )}
    </div>
  )
}
