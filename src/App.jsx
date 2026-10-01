import { useEffect, useRef, useState } from 'react'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import SuggestedPrompts from './components/SuggestedPrompts'
import { runThermalAnalysis } from './data/mockAgent'

let nextId = 1
const newId = () => nextId++

// 把「修改了哪些條件」寫成一句人看得懂的話
function describeChanges(before, after) {
  return Object.keys(after)
    .filter((key) => before[key].value !== after[key].value)
    .map((key) => `${after[key].label} ${before[key].value} → ${after[key].value} ${after[key].unit}`)
    .join('、')
}

export default function App() {
  // 整個對話：使用者訊息 + AI 回覆
  const [messages, setMessages] = useState([])
  // 有沒有正在分析中（分析中就先不能送新問題）
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  // 有新訊息時，自動捲到最下面
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  // 更新某一則 AI 訊息
  function updateMessage(id, patch) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  // 核心流程：送出問題 → 顯示進度 → 顯示結果或錯誤
  async function analyze({ question, override, userText }) {
    const aiId = newId()
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'user', text: userText },
      { id: aiId, role: 'assistant', status: 'running', doneSteps: 0, question, override },
    ])
    setBusy(true)

    try {
      const result = await runThermalAnalysis(question, override, (index) =>
        updateMessage(aiId, { doneSteps: index + 1 }),
      )
      updateMessage(aiId, { status: 'done', result })
    } catch (error) {
      updateMessage(aiId, { status: 'error', error: error.message })
    } finally {
      setBusy(false)
    }
  }

  function handleSend(text) {
    analyze({ question: text, userText: text })
  }

  function handleRerun(message, nextAssumptions) {
    const change = describeChanges(message.result.assumptions, nextAssumptions)
    analyze({
      question: message.question,
      override: nextAssumptions,
      userText: `修改條件後重新分析：${change}`,
    })
  }

  function handleRetry(message) {
    analyze({
      question: message.question,
      override: message.override,
      userText: `再試一次：${message.question}`,
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <svg className="app-header__logo" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#2457d6" />
          <path d="M16 6c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-2-1-4-2-5 0 2-1 3-2 3 1-3 0-6-2-9z" fill="#fff" />
        </svg>
        <div>
          <h1 className="app-header__title">Thermal Assistant</h1>
          <p className="app-header__sub">企業內部工程 AI 助理｜概念作品</p>
        </div>
        <span className="badge">Demo：資料為模擬</span>
      </header>

      <main className="app-main">
        <div className="conversation">
          {messages.length === 0 && <SuggestedPrompts onPick={handleSend} disabled={busy} />}
          <MessageList messages={messages} onRerun={handleRerun} onRetry={handleRetry} busy={busy} />
          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput onSend={handleSend} disabled={busy} />
    </div>
  )
}
