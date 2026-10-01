import { BOARD } from '../data/mockAgent'

// 溫度 → 顏色（藍 → 綠 → 黃 → 橘 → 紅）
const STOPS = [
  [0, [59, 111, 216]],
  [0.25, [124, 198, 184]],
  [0.5, [242, 209, 92]],
  [0.75, [239, 138, 60]],
  [1, [214, 58, 58]],
]

function colorFor(temp, min, max) {
  const t = Math.min(Math.max((temp - min) / (max - min), 0), 1)
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i - 1]
    const [p2, c2] = STOPS[i]
    if (t <= p2) {
      const k = (t - p1) / (p2 - p1)
      const mix = c1.map((v, j) => Math.round(v + (c2[j] - v) * k))
      return `rgb(${mix.join(',')})`
    }
  }
  return 'rgb(214,58,58)'
}

const CELL = 40

export default function Heatmap({ grid, parts, ambient }) {
  const min = ambient
  const max = 105
  const width = BOARD.cols * CELL
  const height = BOARD.rows * CELL

  return (
    <div className="heatmap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`主機板溫度分布圖，最熱的是 ${parts.reduce((a, b) => (a.temp > b.temp ? a : b)).name}`}
      >
        {grid.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x * CELL}
            y={cell.y * CELL}
            width={CELL}
            height={CELL}
            fill={colorFor(cell.temp, min, max)}
          />
        ))}
        {parts.map((p) => (
          <g key={p.id}>
            <rect
              x={p.x * CELL + 3}
              y={p.y * CELL + 3}
              width={p.w * CELL - 6}
              height={p.h * CELL - 6}
              rx="6"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(20,25,35,0.75)"
              strokeWidth={p.margin < 10 ? 3 : 1.5}
              strokeDasharray={p.margin < 0 ? '6 4' : undefined}
            />
            <text
              x={(p.x + p.w / 2) * CELL}
              y={(p.y + p.h / 2) * CELL - 4}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#111"
            >
              {p.name}
            </text>
            <text
              x={(p.x + p.w / 2) * CELL}
              y={(p.y + p.h / 2) * CELL + 12}
              textAnchor="middle"
              fontSize="12"
              fontFamily="ui-monospace, monospace"
              fill="#111"
            >
              {p.temp}°C
            </text>
          </g>
        ))}
      </svg>
      <div className="legend" aria-hidden="true">
        <div className="legend__bar" />
        <div className="legend__labels">
          <span>{min}°C</span>
          <span>{max}°C</span>
        </div>
      </div>
    </div>
  )
}
