import { STEPS } from '../data/mockAgent'

// 顯示「AI 現在在做什麼」：讓等待變得透明
export default function ProgressSteps({ doneCount, running }) {
  return (
    <ol className="steps" aria-live="polite">
      {STEPS.map((label, i) => {
        const done = i < doneCount
        const active = running && i === doneCount
        const state = done ? 'done' : active ? 'active' : 'todo'
        return (
          <li key={label} className={`step step--${state}`}>
            <span className="step__icon" aria-hidden="true">
              {done ? '✓' : ''}
            </span>
            <span>{label}</span>
            <span className="sr-only">
              {done ? '（完成）' : active ? '（進行中）' : '（等待中）'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
