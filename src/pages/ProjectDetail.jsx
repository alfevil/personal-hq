import React, { useState } from 'react'
import {
  ArrowLeft, Plus, Trash2, CheckSquare, Square,
  ChevronDown, ChevronUp, Link2, FileText, MoreHorizontal, Edit3
} from 'lucide-react'
import { calcProgress } from '../hooks/useProjects'
import Modal from '../components/Modal'

const STAGE_STATUSES = [
  { id: 'todo',       label: 'Не начат',  color: 'text-text-muted' },
  { id: 'in_progress', label: 'В процессе', color: 'text-status-blue' },
  { id: 'done',       label: 'Готово',    color: 'text-status-green' },
]

const PROJECT_STATUS_OPTIONS = ['active', 'frozen', 'done']
const STATUS_LABELS = { active: 'Активен', frozen: 'Заморожен', done: 'Завершён' }

export default function ProjectDetail({
  project, onBack, hooks
}) {
  const {
    updateProject, deleteProject,
    addStage, updateStage, deleteStage,
    addTask, toggleTask, deleteTask,
    addNote, deleteNote,
    addLink, deleteLink,
  } = hooks

  const [activeSection, setActiveSection] = useState('stages')
  const [addStageInput, setAddStageInput] = useState('')
  const [taskInputs, setTaskInputs] = useState({})
  const [noteInput, setNoteInput] = useState('')
  const [linkModal, setLinkModal] = useState(false)
  const [linkForm, setLinkForm] = useState({ title: '', url: '' })
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(project.name)

  const progress = calcProgress(project)
  const stages = project.stages || []
  const tasks = project.tasks || []
  const notes = project.notes || []
  const links = project.links || []

  const handleAddStage = async () => {
    if (!addStageInput.trim()) return
    await addStage(project.id, addStageInput.trim())
    setAddStageInput('')
  }

  const handleAddTask = async (stageId) => {
    const val = taskInputs[stageId]?.trim()
    if (!val) return
    await addTask(project.id, stageId, val)
    setTaskInputs(p => ({ ...p, [stageId]: '' }))
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    await addNote(project.id, noteInput.trim())
    setNoteInput('')
  }

  const handleAddLink = async () => {
    if (!linkForm.url.trim()) return
    let url = linkForm.url.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    await addLink(project.id, linkForm.title.trim() || url, url)
    setLinkModal(false)
    setLinkForm({ title: '', url: '' })
  }

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput.trim() !== project.name) {
      await updateProject(project.id, { name: nameInput.trim() })
    }
    setEditingName(false)
  }

  const SECTIONS = [
    { id: 'stages', label: 'Этапы', count: stages.length },
    { id: 'tasks',  label: 'Задачи', count: tasks.filter(t => !t.stage_id).length },
    { id: 'notes',  label: 'Заметки', count: notes.length },
    { id: 'links',  label: 'Ссылки', count: links.length },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-bg-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1.5 -ml-1 rounded-lg hover:bg-bg-hover text-text-secondary">
            <ArrowLeft size={18} />
          </button>
          {editingName ? (
            <input
              className="flex-1 text-lg font-bold bg-transparent border-b border-accent text-text-primary outline-none pb-0.5"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 flex-1" onClick={() => setEditingName(true)}>
              <div className="w-3 h-3 rounded-full" style={{ background: project.color }} />
              <h1 className="text-lg font-bold text-text-primary truncate">{project.name}</h1>
              <Edit3 size={12} className="text-text-muted flex-shrink-0" />
            </div>
          )}
          <select
            value={project.status}
            onChange={e => updateProject(project.id, { status: e.target.value })}
            className="text-xs bg-bg-hover border border-bg-border rounded-lg px-2 py-1 text-text-secondary"
          >
            {PROJECT_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>Прогресс</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: project.color }}
            />
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-bg-border overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === s.id
                ? 'bg-accent/15 text-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {s.label}
            {s.count > 0 && (
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                activeSection === s.id ? 'bg-accent/20' : 'bg-bg-hover'
              }`}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">

        {/* STAGES */}
        {activeSection === 'stages' && (
          <div className="space-y-3">
            {/* Add stage */}
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Название этапа..."
                value={addStageInput}
                onChange={e => setAddStageInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddStage()}
              />
              <button onClick={handleAddStage} className="btn-accent px-3">
                <Plus size={16} />
              </button>
            </div>

            {stages.length === 0 && (
              <p className="text-center text-sm text-text-muted py-8">Нет этапов</p>
            )}

            {stages.map(stage => {
              const stageTasks = tasks.filter(t => t.stage_id === stage.id)
              const doneCount = stageTasks.filter(t => t.done).length
              const stageProgress = stageTasks.length
                ? Math.round((doneCount / stageTasks.length) * 100)
                : 0

              return (
                <div key={stage.id} className="card p-3 fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-sm text-text-primary truncate">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <select
                        value={stage.status}
                        onChange={e => updateStage(project.id, stage.id, { status: e.target.value })}
                        className="text-[10px] bg-bg-hover border border-bg-border rounded px-1.5 py-0.5 text-text-secondary"
                      >
                        {STAGE_STATUSES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteStage(project.id, stage.id)}
                        className="p-1 text-text-muted hover:text-status-red"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {stageTasks.length > 0 && (
                    <div className="h-1 bg-bg-hover rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${stageProgress}%`, background: project.color }}
                      />
                    </div>
                  )}

                  {/* Tasks in stage */}
                  <div className="space-y-1 mb-2">
                    {stageTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(project.id, task.id, task.done)}
                        onDelete={() => deleteTask(project.id, task.id)}
                      />
                    ))}
                  </div>

                  {/* Add task to stage */}
                  <div className="flex gap-1.5">
                    <input
                      className="flex-1 bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted"
                      placeholder="Добавить задачу..."
                      value={taskInputs[stage.id] || ''}
                      onChange={e => setTaskInputs(p => ({ ...p, [stage.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(stage.id)}
                    />
                    <button
                      onClick={() => handleAddTask(stage.id)}
                      className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FREE TASKS */}
        {activeSection === 'tasks' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Задача без этапа..."
                value={taskInputs['free'] || ''}
                onChange={e => setTaskInputs(p => ({ ...p, free: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addTask(project.id, null, e.target.value.trim())
                    setTaskInputs(p => ({ ...p, free: '' }))
                  }
                }}
              />
              <button
                onClick={() => {
                  const val = taskInputs['free']?.trim()
                  if (val) {
                    addTask(project.id, null, val)
                    setTaskInputs(p => ({ ...p, free: '' }))
                  }
                }}
                className="btn-accent px-3"
              >
                <Plus size={16} />
              </button>
            </div>

            {tasks.filter(t => !t.stage_id).length === 0 && (
              <p className="text-center text-sm text-text-muted py-8">Нет свободных задач</p>
            )}

            {tasks.filter(t => !t.stage_id).map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTask(project.id, task.id, task.done)}
                onDelete={() => deleteTask(project.id, task.id)}
              />
            ))}
          </div>
        )}

        {/* NOTES */}
        {activeSection === 'notes' && (
          <div className="space-y-3">
            <div>
              <textarea
                className="input-field resize-none w-full"
                rows={3}
                placeholder="Напиши что угодно... *жирный*, - список"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
              <button onClick={handleAddNote} className="btn-accent w-full mt-2">
                Сохранить заметку
              </button>
            </div>

            {notes.length === 0 && (
              <p className="text-center text-sm text-text-muted py-8">Нет заметок</p>
            )}

            {notes.map(note => (
              <div key={note.id} className="card p-3 fade-in">
                <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-text-muted font-mono">
                    {new Date(note.created_at).toLocaleDateString('ru')}
                  </span>
                  <button
                    onClick={() => deleteNote(project.id, note.id)}
                    className="p-1 text-text-muted hover:text-status-red"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LINKS */}
        {activeSection === 'links' && (
          <div className="space-y-2">
            <button
              onClick={() => setLinkModal(true)}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Добавить ссылку
            </button>

            {links.length === 0 && (
              <p className="text-center text-sm text-text-muted py-8">Нет ссылок</p>
            )}

            {links.map(link => (
              <div key={link.id} className="card p-3 flex items-center gap-3 fade-in">
                <Link2 size={14} className="text-accent flex-shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-text-primary hover:text-accent transition-colors truncate"
                >
                  {link.title}
                </a>
                <button
                  onClick={() => deleteLink(project.id, link.id)}
                  className="p-1 text-text-muted hover:text-status-red"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      <Modal open={linkModal} onClose={() => setLinkModal(false)} title="Добавить ссылку">
        <div className="space-y-3">
          <input
            className="input-field"
            placeholder="Название (опционально)"
            value={linkForm.title}
            onChange={e => setLinkForm(p => ({ ...p, title: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="https://..."
            value={linkForm.url}
            onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))}
            type="url"
          />
          <div className="flex gap-2">
            <button onClick={() => setLinkModal(false)} className="flex-1 btn-ghost border border-bg-border">
              Отмена
            </button>
            <button onClick={handleAddLink} className="flex-1 btn-accent">
              Добавить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 group fade-in`}>
      <button onClick={onToggle} className="flex-shrink-0 text-text-muted hover:text-accent transition-colors">
        {task.done
          ? <CheckSquare size={15} className="text-accent check-anim" />
          : <Square size={15} />
        }
      </button>
      <span className={`flex-1 text-sm transition-all ${task.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
        {task.title}
      </span>
      {task.deadline && (
        <span className="text-[10px] text-text-muted font-mono">
          {new Date(task.deadline).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
        </span>
      )}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-status-red transition-all"
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}
