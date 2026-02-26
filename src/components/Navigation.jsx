import React from 'react'

const TABS = [
  { id: 'thoughts', icon: '🧠', label: 'Мысли' },
  { id: 'projects', icon: '📁', label: 'Проекты' },
  { id: 'budget',   icon: '💰', label: 'Бюджет' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
]

export default function Navigation({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-bg-card/95 backdrop-blur-xl border-t border-bg-border px-2 pb-safe">
        <div className="flex items-center justify-around">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-3 px-4 rounded-xl transition-all duration-200 active:scale-90 ${
                active === tab.id
                  ? 'text-accent'
                  : 'text-text-muted'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className={`text-[10px] font-medium transition-all ${
                active === tab.id ? 'text-accent' : 'text-text-muted'
              }`}>
                {tab.label}
              </span>
              {active === tab.id && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
