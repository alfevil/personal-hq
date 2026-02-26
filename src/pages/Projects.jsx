import React, { useState } from 'react'
import { Plus, ChevronRight, Archive, CheckCircle, Circle } from 'lucide-react'
import { calcProgress } from '../hooks/useProjects'
import Modal from '../components/Modal'

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#64748b',
]

const STATUS_LABEL = {
  active: { label: 'Активен', color: 'text-status-green' },
  frozen: { label: 'Заморожен', color: 'text-status-yellow' },
  done:   { label: 'Завершён', color: 'text-text-muted' },
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color || '#6366f1' }}
      />
    </div>
  )
}

export default function Projects({ projects, loading, addProject, onSelectProject }) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', deadline: '', status: 'active', color: '#6366f1'
  })

  const activeProjects = projects.filter(p => p.status === 'active')
  const otherProjects = projects.filter(p => p.status !== 'active')

  const handleCreate = async () => {
    if (!form.name.trim()) return
    await addProject({
      name: form.name.trim(),
      description: form.description.trim() || null,
      deadline: form.deadline || null,
      status: form.status,
      color: form.color,
    })
    setModal(false)
    setForm({ name: '', description: '', deadline: '', status: 'active', color: '#6366f1' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-text-primary">📁 Проекты</h1>
        <button onClick={() => setModal(true)} className="btn-accent flex items-center gap-1.5">
          <Plus size={14} />
          Новый
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-16 text-text-muted text-sm">Загрузка...</div>
        )}

        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <span className="text-4xl mb-3">📂</span>
            <p className="text-sm">Нет проектов. Создай первый.</p>
          </div>
        )}

        {activeProjects.length > 0 && (
          <div>
            <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Активные</p>
            <div className="space-y-2">
              {activeProjects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => onSelectProject(p)} />
              ))}
            </div>
          </div>
        )}

        {otherProjects.length > 0 && (
          <div>
            <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Остальные</p>
            <div className="space-y-2">
              {otherProjects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => onSelectProject(p)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Новый проект">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Название *</label>
            <input
              className="input-field"
              placeholder="Название проекта..."
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Описание</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="О чём проект..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Дедлайн</label>
            <input
              type="date"
              className="input-field text-text-primary"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-2 block">Цвет</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-card scale-110' : ''
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 btn-ghost border border-bg-border">
              Отмена
            </button>
            <button onClick={handleCreate} className="flex-1 btn-accent">
              Создать
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProjectCard({ project, onClick }) {
  const progress = calcProgress(project)
  const status = STATUS_LABEL[project.status] || STATUS_LABEL.active
  const tasksDone = (project.tasks || []).filter(t => t.done).length
  const tasksTotal = (project.tasks || []).length

  return (
    <button
      onClick={onClick}
      className="card w-full text-left p-4 hover:border-bg-hover active:scale-[0.98] transition-all duration-150 fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <span className="font-semibold text-text-primary text-sm">{project.name}</span>
        </div>
        <ChevronRight size={14} className="text-text-muted flex-shrink-0 mt-0.5" />
      </div>

      {project.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-1">{project.description}</p>
      )}

      <div className="mb-2">
        <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: project.color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs ${status.color}`}>{status.label}</span>
        <span className="text-xs text-text-muted font-mono">
          {tasksTotal > 0 ? `${tasksDone}/${tasksTotal} задач` : 'Нет задач'}
        </span>
      </div>
    </button>
  )
}
