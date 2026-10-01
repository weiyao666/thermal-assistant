const EXAMPLES = [
  { tag: '條件完整', text: '這張主機板在 35°C 環境、滿載、風速 2 m/s 下，會不會過熱？' },
  { tag: '條件不完整', text: '夏天機房比較熱，這張板子撐得住嗎？' },
  { tag: '極端情況', text: '45°C、滿載、風扇故障只剩 0.8 m/s，哪個元件最先出問題？' },
  { tag: '錯誤狀態', text: '測試錯誤：模擬 AI 服務沒有回應' },
]

export default function SuggestedPrompts({ onPick, disabled }) {
  return (
    <section className="empty" aria-labelledby="empty-title">
      <h2 id="empty-title" className="empty__title">想先確認哪個散熱條件？</h2>
      <p className="empty__desc">
        用一句話描述情境，AI 會估算主機板各元件的溫度，並清楚標出哪些條件是你給的、哪些是 AI 自己假設的。
      </p>
      <div className="prompts">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.text}
            type="button"
            className="prompt-card"
            onClick={() => onPick(ex.text)}
            disabled={disabled}
          >
            <span className="prompt-card__tag">{ex.tag}</span>
            {ex.text}
          </button>
        ))}
      </div>
    </section>
  )
}
