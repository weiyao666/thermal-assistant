// ─────────────────────────────────────────────────────────────
// 模擬的「散熱分析 AI」
// 現在是假資料，之後（第三階段）會換成真的 AI API。
// 重點：回傳的資料格式先定好，換成真 API 時，畫面完全不用改。
// ─────────────────────────────────────────────────────────────

// 預設條件：使用者沒講的，AI 就自己假設，並且在畫面上標示「AI 假設」
export const DEFAULT_ASSUMPTIONS = {
  ambient: { label: '環境溫度', value: 25, unit: '°C', min: 0, max: 60, step: 1 },
  load: { label: '負載', value: 100, unit: '%', min: 0, max: 100, step: 5 },
  airflow: { label: '風速', value: 2, unit: 'm/s', min: 0.5, max: 6, step: 0.5 },
}

// 主機板上的元件：位置（格子座標）、發熱量、熱阻、溫度上限
const COMPONENTS = [
  { id: 'cpu', name: 'CPU', x: 5, y: 3, w: 3, h: 3, heat: 350, r: 0.214, limit: 95 },
  { id: 'vrm', name: 'VRM', x: 2, y: 3, w: 2, h: 3, heat: 60, r: 1.414, limit: 105 },
  { id: 'dimm', name: 'DIMM', x: 9, y: 1, w: 2, h: 6, heat: 40, r: 1.237, limit: 85 },
  { id: 'pch', name: 'PCH', x: 5, y: 7, w: 2, h: 1, heat: 20, r: 2.33, limit: 90 },
  { id: 'nic', name: 'NIC', x: 0, y: 0, w: 2, h: 2, heat: 25, r: 2.26, limit: 100 },
]

export const BOARD = { cols: 12, rows: 9 }

// 從一句話裡抓出條件，例如「35°C、滿載、風速 1.5 m/s」
export function parseAssumptions(question) {
  const found = {}
  const temp = question.match(/(\d+(?:\.\d+)?)\s*(?:°|度)\s*C?/i)
  if (temp) found.ambient = Number(temp[1])

  const percent = question.match(/(\d+(?:\.\d+)?)\s*%/)
  if (percent) found.load = Number(percent[1])
  else if (/滿載|全速|full/i.test(question)) found.load = 100
  else if (/半載|一半/.test(question)) found.load = 50
  else if (/待機|閒置|idle/i.test(question)) found.load = 10

  const wind = question.match(/(\d+(?:\.\d+)?)\s*m\/s/i)
  if (wind) found.airflow = Number(wind[1])

  return found
}

// 使用者沒給數字，但有線索時，AI 從上下文推測（並說明理由）
function guessFromContext(question) {
  const guesses = {}
  if (/夏天|很熱|比較熱|高溫/.test(question)) {
    guesses.ambient = { value: 35, reason: '你提到「熱」或「夏天」，先用 35°C 估算' }
  }
  if (/風扇.*(故障|壞)|散熱不良/.test(question)) {
    guesses.airflow = { value: 1, reason: '你提到風扇異常，先用 1 m/s 估算' }
  }
  return guesses
}

// 把「使用者說的」和「AI 假設的」合在一起，並記錄每個值的來源
export function buildAssumptions(userValues = {}, guesses = {}) {
  const result = {}
  for (const [key, base] of Object.entries(DEFAULT_ASSUMPTIONS)) {
    if (userValues[key] !== undefined) {
      result[key] = { ...base, value: userValues[key], source: 'user' }
    } else if (guesses[key]) {
      result[key] = { ...base, value: guesses[key].value, source: 'ai', reason: guesses[key].reason }
    } else {
      result[key] = { ...base, source: 'ai', reason: '你沒有提到，先用常見的預設值' }
    }
  }
  return result
}

// 簡化的散熱模型（作品集用，不是真的物理模擬）
function estimate(assumptions) {
  const ambient = assumptions.ambient.value
  const load = assumptions.load.value / 100
  const airflow = Math.max(assumptions.airflow.value, 0.1)

  const parts = COMPONENTS.map((c) => {
    const temp = ambient + (c.heat * load * c.r) / Math.sqrt(airflow)
    const rounded = Math.round(temp * 10) / 10
    return { ...c, temp: rounded, margin: Math.round((c.limit - rounded) * 10) / 10 }
  })

  const worst = parts.reduce((a, b) => (a.margin < b.margin ? a : b))
  let verdict = 'ok'
  if (worst.margin < 0) verdict = 'danger'
  else if (worst.margin < 10) verdict = 'warning'

  // 格子熱圖：每一格的溫度 = 環境溫度 + 附近元件的熱影響
  const grid = []
  for (let y = 0; y < BOARD.rows; y++) {
    for (let x = 0; x < BOARD.cols; x++) {
      let t = ambient
      for (const p of parts) {
        const cx = p.x + p.w / 2 - 0.5
        const cy = p.y + p.h / 2 - 0.5
        const d2 = (x - cx) ** 2 + (y - cy) ** 2
        t += (p.temp - ambient) * Math.exp(-d2 / (1.2 * (p.w + p.h)))
      }
      grid.push({ x, y, temp: Math.round(t * 10) / 10 })
    }
  }

  return { parts, worst, verdict, grid }
}

const NEXT_STEPS = {
  ok: ['條件內有足夠餘裕，可以進入下一個設計階段', '若要正式簽核，仍建議跑一次完整 CFD 模擬'],
  warning: [
    '餘裕不到 10°C，建議提高風速或調整風扇曲線再試一次',
    '檢查散熱片與 CPU 之間的導熱材料',
    '正式簽核前，請跑完整 CFD 模擬確認',
  ],
  danger: [
    '已超過元件溫度上限，這個條件不建議出貨',
    '優先處理溫度最高的元件：加大散熱片或增加風量',
    '請與散熱工程師確認後，再跑完整 CFD 模擬',
  ],
}

// 可信度：使用者講得越完整，AI 越有把握
function confidenceOf(assumptions) {
  const aiGuessed = Object.values(assumptions).filter((a) => a.source === 'ai').length
  if (aiGuessed === 0) return { level: 'high', label: '高', note: '所有條件都由你提供' }
  if (aiGuessed === 1) return { level: 'medium', label: '中', note: '有 1 個條件是 AI 自行假設' }
  return { level: 'low', label: '低', note: `有 ${aiGuessed} 個條件是 AI 自行假設，建議補上實際數值` }
}

export const STEPS = [
  '理解問題，找出條件',
  '套用散熱模型估算',
  '與元件溫度上限比對',
  '整理結果與建議',
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 執行一次分析（模擬 AI API）
 * @param {string} question  使用者的問題
 * @param {object} [override] 使用者手動修改過的條件（重新分析時用）
 * @param {(index:number)=>void} [onStep] 每完成一個步驟就回報，讓畫面顯示進度
 */
export async function runThermalAnalysis(question, override, onStep = () => {}) {
  // 模擬偶爾失敗，讓我們能設計錯誤狀態（輸入「測試錯誤」就會觸發）
  if (question.includes('測試錯誤')) {
    await wait(600)
    throw new Error('模型服務暫時沒有回應')
  }

  const assumptions = override ?? buildAssumptions(parseAssumptions(question), guessFromContext(question))

  for (let i = 0; i < STEPS.length; i++) {
    await wait(450 + Math.random() * 350)
    onStep(i)
  }

  const { parts, worst, verdict, grid } = estimate(assumptions)

  return {
    assumptions,
    parts,
    worst,
    verdict,
    grid,
    confidence: confidenceOf(assumptions),
    nextSteps: NEXT_STEPS[verdict],
  }
}
