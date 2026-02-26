import React, { useState, useRef } from 'react'
import { Pin, FolderOpen, Trash2, Hash } from 'lucide-react'
import { useThoughts } from '../hooks/useThoughts'

const FILTERS = [
  { id: 'all', label: 'Всё' },
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'Неделя' },
]

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

function renderContent(text) {
  // highlight #tags
  return text.split(/(#[\w\u0400-\u04FF]+)/g).map((part, i) =>
    part.startsWith('#')
      ? <span key={i} className="text-accent font-medium">{part}</span>
      : <span key={i}>{part}</span>
  )
}

export default function Thoughts({ onMoveToProject, projects }) {
  const { thoughts, loading, add, remove, togglePin } = useThoughts()
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(null)
  const inputRef = useRef(null)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    await add(trimmed)
  }



  const filteredThoughts = thoughts.filter(t => {
    const d = new Date(t.created_at)
    const now = new Date()
    if (filter === 'today' && d.toDateString() !== now.toDateString()) return false
    if (filter === 'week') {
      const weekAgo = new Date(now - 7 * 86400000)
      if (d < weekAgo) return false
    }
    if (tagFilter && !t.tags?.includes(tagFilter)) return false
    return true
  })

  // Collect all tags
  const allTags = [...new Set(thoughts.flatMap(t => t.tags || []))]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-text-primary">🧠 Мысли</h1>
      </div>

      {/* Input */}
      <div className="px-4 pb-3">
        <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden focus-within:border-accent transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Что на уме? Используй #тег для категоризации..."
            rows={2}
            className="w-full px-4 pt-3 pb-0 text-sm text-text-primary placeholder-text-muted resize-none bg-transparent"
          />
          <div className="flex items-center justify-end px-3 py-2">
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="btn-accent py-1 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f.id
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            {f.label}
          </button>
        ))}
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${tagFilter === tag
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            <Hash size={10} />
            {tag}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-16 text-text-muted text-sm">
            Загрузка...
          </div>
        )}
        {!loading && filteredThoughts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <span className="text-4xl mb-3">💭</span>
            <p className="text-sm">Пусто. Добавь первую мысль.</p>
          </div>
        )}
        {filteredThoughts.map(thought => (
          <div
            key={thought.id}
            className={`card p-3.5 fade-in ${thought.pinned ? 'border-accent/30' : ''}`}
          >
            {thought.pinned && (
              <div className="flex items-center gap-1 mb-1.5">
                <Pin size={10} className="text-accent fill-accent" />
                <span className="text-xs text-accent/70">Закреплено</span>
              </div>
            )}
            <p className="text-sm text-text-primary leading-relaxed">
              {renderContent(thought.content)}
            </p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-text-muted font-mono">
                {formatDate(thought.created_at)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePin(thought.id, thought.pinned)}
                  className={`p-1.5 rounded-lg transition-all ${thought.pinned
                      ? 'text-accent bg-accent/10'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                    }`}
                  title="Закрепить"
                >
                  <Pin size={13} className={thought.pinned ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={() => onMoveToProject?.(thought)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
                  title="Перенести в проект"
                >
                  <FolderOpen size={13} />
                </button>
                <button
                  onClick={() => remove(thought.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-status-red hover:bg-status-red/10 transition-all"
                  title="Удалить"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
