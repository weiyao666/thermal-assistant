// ═════════════════════════════════════════════════════════════
// 任務 1：讓輸入框真的能送出問題
//
// 你會練到：useState、受控元件（controlled component）、事件處理
// 完成後的樣子：打字 → 按 Enter 或「送出」→ 問題出現在對話裡，輸入框清空
//
// 卡住的話，可以把錯誤訊息或你的程式碼貼給 Claude 一起看。
// ═════════════════════════════════════════════════════════════

// TODO 1-1：從 react 引入 useState
//   提示：import { useState } from 'react'
import { useState } from 'react'


export default function ChatInput({ onSend, disabled }) {
  // 這個元件從父層（App.jsx）拿到兩個東西：
  //   onSend(text)：把問題交給 App 去分析
  //   disabled：AI 正在分析時是 true，這時不能再送出

  // TODO 1-2：建立一個 text 狀態，用來記住輸入框裡的字，初始值是空字串
  //   提示：const [text, setText] = useState('')
  const [text, setText] = useState('')



  function submit() {
    // TODO 1-3：完成送出的邏輯，照這四步：
    //   (1) 把 text 前後的空白去掉（.trim()）
    //   (2) 如果去掉空白後是空的，或 disabled 是 true，就直接 return
    //   (3) 呼叫 onSend，把問題交出去
    //   (4) 用 setText('') 把輸入框清空
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  function handleSubmit(event) {
    event.preventDefault() // 防止表單送出時整頁重新整理
    submit()
  }

  function handleKeyDown(event) {
    // TODO 1-4：按 Enter 送出，按 Shift + Enter 換行
    //   提示：當 event.key === 'Enter' 而且沒有按 Shift（!event.shiftKey）時：
    //         先 event.preventDefault()（不要換行），再呼叫 submit()
    //
    //   ⚠️ 設計師才會注意到的細節：
    //   用注音或倉頡選字時，也會按 Enter。如果這時就送出，字還沒選完訊息就出去了。
    //   所以條件還要加上 !event.nativeEvent.isComposing
    //   面試時可以講這個例子：這就是「懂使用者」和「只會寫程式」的差別。
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="composer">
      <form className="composer__form" onSubmit={handleSubmit}>
        <label htmlFor="question" className="sr-only">
          輸入你的問題
        </label>
        <textarea
          id="question"
          className="composer__input"
          rows={1}
          placeholder="描述情境，例如：35°C、滿載，會不會過熱？"
          // TODO 1-5：把輸入框變成「受控元件」，加上這兩個屬性：
          //   value={text}
          //   onChange={(event) => setText(event.target.value)}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          type="submit"
          className="btn btn--primary composer__send"
          // TODO 1-6（加分）：沒打字的時候按鈕也要不能按
          //   提示：disabled={disabled || !text.trim()}
          disabled={disabled || !text.trim()}
          
        >
          送出
        </button>
      </form>
      <p className="composer__hint">Enter 送出，Shift + Enter 換行</p>
    </div>

  )

}
