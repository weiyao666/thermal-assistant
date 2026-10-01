import Heatmap from './Heatmap'
import AssumptionChips from './AssumptionChips'

const VERDICT = {
  ok: { icon: '✓', title: '安全', desc: '所有元件都在溫度上限內，而且留有足夠餘裕。' },
  warning: { icon: '!', title: '需要注意', desc: '沒有超標，但有元件的餘裕不到 10°C。' },
  danger: { icon: '✕', title: '過熱風險', desc: '至少有一個元件超過溫度上限。' },
}

function Confidence({ confidence }) {
  const on = { high: 3, medium: 2, low: 1 }[confidence.level]
  return (
    <div className="confidence">
      <span>可信度：{confidence.label}</span>
      <span className="confidence__dots" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`confidence__dot ${i < on ? 'confidence__dot--on' : ''}`} />
        ))}
      </span>
      <span className="chip__source">{confidence.note}</span>
    </div>
  )
}

export default function ResultCard({ result, onRerun, disabled }) {
  const v = VERDICT[result.verdict]
  const { worst } = result

  return (
    <>
      {/* 1. 先講結論：一眼看懂 */}
      <div className={`verdict verdict--${result.verdict}`} role="status">
        <span className="verdict__icon" aria-hidden="true">{v.icon}</span>
        <div>
          <p className="verdict__title">{v.title}</p>
          <p className="verdict__desc">{v.desc}</p>
        </div>
      </div>

      {/* 2. 關鍵數字 */}
      <div className="card__section">
        <div className="metrics">
          <div className="metric">
            <span className="metric__label">最需要注意的元件</span>
            <span className="metric__value">{worst.name}</span>
          </div>
          <div className="metric">
            <span className="metric__label">預估溫度 / 上限</span>
            <span className="metric__value">
              {worst.temp} / {worst.limit}°C
            </span>
          </div>
          <div className="metric">
            <span className="metric__label">剩餘餘裕</span>
            <span className="metric__value">
              {worst.margin > 0 ? '+' : ''}
              {worst.margin}°C
            </span>
          </div>
        </div>
      </div>

      {/* 3. 依據：讓人能檢查 */}
      <div className="card__section">
        <h3 className="section-title">溫度分布</h3>
        <div className="heatmap-wrap">
          <Heatmap grid={result.grid} parts={result.parts} ambient={result.assumptions.ambient.value} />
          <ul className="parts" aria-label="各元件溫度">
            {[...result.parts]
              .sort((a, b) => a.margin - b.margin)
              .map((p) => (
                <li key={p.id} className={`part ${p.id === worst.id ? 'part--worst' : ''}`}>
                  <span>{p.name}</span>
                  <span className="part__temp">{p.temp}°C</span>
                  <span
                    className={`part__temp ${
                      p.margin < 0 ? 'part__margin--over' : p.margin < 10 ? 'part__margin--low' : ''
                    }`}
                  >
                    {p.margin > 0 ? '+' : ''}
                    {p.margin}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* 4. 條件：讓人能修改，重新分析 */}
      <div className="card__section">
        <h3 className="section-title">這次分析用的條件</h3>
        <AssumptionChips assumptions={result.assumptions} onRerun={onRerun} disabled={disabled} />
        <p className="hint">實線是你提供的條件，虛線是 AI 自行假設的。點一下就能修改並重新分析。</p>
        {Object.values(result.assumptions).some((a) => a.source === 'ai') && (
          <ul className="hint reasons">
            {Object.values(result.assumptions)
              .filter((a) => a.source === 'ai')
              .map((a) => (
                <li key={a.label}>
                  {a.label} {a.value} {a.unit}：{a.reason}
                </li>
              ))}
          </ul>
        )}
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Confidence confidence={result.confidence} />
        </div>
      </div>

      {/* 5. 下一步：人來做決定 */}
      <div className="card__section">
        <h3 className="section-title">建議的下一步</h3>
        <ul className="next-steps">
          {result.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="card__section">
        <p className="disclaimer">
          這是快速估算，用來幫助判斷方向。正式簽核前，請以完整 CFD 模擬與實測結果為準。
        </p>
      </div>
    </>
  )
}
