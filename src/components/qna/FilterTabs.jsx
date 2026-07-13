import { useLayoutEffect, useRef, useState } from 'react'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'answered', label: '답변완료' },
  { key: 'unanswered', label: '미답변' },
]

export function FilterTabs({ filter, onChange }) {
  const btnRefs = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const el = btnRefs.current[filter]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [filter])

  return (
    <div className="relative flex h-9 items-center gap-1">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          ref={(el) => {
            btnRefs.current[f.key] = el
          }}
          type="button"
          onClick={() => onChange(f.key)}
          className={`tab-btn ${filter === f.key ? 'tab-btn-active' : ''}`}
        >
          {f.label}
        </button>
      ))}
      <span className="tab-indicator" style={{ left: indicator.left, width: indicator.width }} />
    </div>
  )
}
