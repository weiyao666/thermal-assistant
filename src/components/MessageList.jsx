import ProgressSteps from './ProgressSteps'
import ResultCard from './ResultCard'

export default function MessageList({ messages, onRerun, onRetry, busy }) {
  return messages.map((m) => {
    if (m.role === 'user') {
      return (
        <div key={m.id} className="msg-user">
          {m.text}
        </div>
      )
    }

    // AI 的回覆
    return (
      <article key={m.id} className="card" aria-label="AI 分析結果">
        {m.status === 'running' && (
          <div className="card__section">
            <h3 className="section-title">AI 正在分析</h3>
            <ProgressSteps doneCount={m.doneSteps} running />
          </div>
        )}

        {m.status === 'error' && (
          <div className="card__section error" role="alert">
            <span aria-hidden="true">⚠</span>
            <div>
              <p>分析沒有完成：{m.error}</p>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => onRetry(m)} disabled={busy}>
                再試一次
              </button>
            </div>
          </div>
        )}

        {m.status === 'done' && (
          <ResultCard result={m.result} onRerun={(next) => onRerun(m, next)} disabled={busy} />
        )}
      </article>
    )
  })
}
