import React, { useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { Plus, ChevronLeft, ChevronRight, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useBudget, CATEGORIES, INCOME_CATEGORIES, getCat } from '../hooks/useBudget'
import Modal from '../components/Modal'

function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export default function Budget() {
  const {
    transactions, limits, loading,
    addTransaction, deleteTransaction, setLimit,
    getMonthStats, getCategorySpend,
  } = useBudget()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [addModal, setAddModal] = useState(false)
  const [limitsModal, setLimitsModal] = useState(false)
  const [form, setForm] = useState({ amount: '', type: 'expense', category: 'food', comment: '' })

  const stats = getMonthStats(viewYear, viewMonth)
  const catSpend = getCategorySpend(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

  const handleAdd = async () => {
    if (!form.amount || isNaN(Number(form.amount))) return
    await addTransaction({
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      comment: form.comment || null,
      date: new Date().toISOString(),
    })
    setAddModal(false)
    setForm({ amount: '', type: 'expense', category: 'food', comment: '' })
  }

  // Pie chart data
  const pieData = CATEGORIES
    .filter(c => catSpend[c.id])
    .map(c => ({ name: c.label, value: catSpend[c.id], color: c.color, id: c.id }))

  // Day-by-day chart
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const dayData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dayTxs = stats.txs.filter(t => {
      const d = new Date(t.date)
      return d.getDate() === day
    })
    return {
      day: day,
      расходы: dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      доходы: dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    }
  }).filter(d => d.расходы > 0 || d.доходы > 0)

  // Top 5 transactions
  const top5 = [...stats.txs]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)

  // Prev month comparison
  const prevStats = getMonthStats(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  )
  const expenseDiff = stats.expense - prevStats.expense

  const budgetUsedPct = stats.income > 0 ? Math.min((stats.expense / stats.income) * 100, 100) : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-text-primary">💰 Бюджет</h1>
          <button onClick={() => setAddModal(true)} className="btn-accent flex items-center gap-1.5">
            <Plus size={14} />
            Добавить
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-text-primary text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-bg-border">
        {[['dashboard', 'Обзор'], ['analytics', 'Аналитика'], ['history', 'История']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === id ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setLimitsModal(true)}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary"
        >
          Лимиты
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {/* Big numbers */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Доходы" value={stats.income} color="text-status-green" icon="↑" />
              <StatCard label="Расходы" value={stats.expense} color="text-status-red" icon="↓" />
              <StatCard label="Остаток" value={stats.balance} color={stats.balance >= 0 ? 'text-accent' : 'text-status-red'} icon="=" />
            </div>

            {/* Budget bar */}
            {stats.income > 0 && (
              <div className="card p-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-muted">Потрачено от дохода</span>
                  <span className={`font-mono font-medium ${budgetUsedPct > 90 ? 'text-status-red' : budgetUsedPct > 70 ? 'text-status-yellow' : 'text-text-primary'}`}>
                    {Math.round(budgetUsedPct)}%
                  </span>
                </div>
                <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${budgetUsedPct}%`,
                      background: budgetUsedPct > 90 ? '#f87171' : budgetUsedPct > 70 ? '#fbbf24' : '#6366f1'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Comparison */}
            {prevStats.expense > 0 && (
              <div className="card p-3 flex items-center gap-2">
                {expenseDiff > 0
                  ? <TrendingUp size={16} className="text-status-red" />
                  : <TrendingDown size={16} className="text-status-green" />
                }
                <span className="text-sm text-text-secondary">
                  {expenseDiff > 0 ? '+' : ''}{formatMoney(expenseDiff)} ₽
                  <span className="text-text-muted"> vs прошлый месяц</span>
                </span>
              </div>
            )}

            {/* Category limits */}
            <div className="space-y-2">
              {CATEGORIES.filter(c => limits[c.id] && catSpend[c.id]).map(cat => {
                const spent = catSpend[cat.id] || 0
                const limit = limits[cat.id]
                const pct = Math.min((spent / limit) * 100, 100)
                const over = spent > limit
                const warn = pct >= 80 && !over
                return (
                  <div key={cat.id} className="card p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary">{cat.icon} {cat.label}</span>
                      <span className={`font-mono ${over ? 'text-status-red' : warn ? 'text-status-yellow' : 'text-text-muted'}`}>
                        {formatMoney(spent)} / {formatMoney(limit)} ₽
                        {over && ' 🔴'}{warn && ' 🟡'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: over ? '#f87171' : warn ? '#fbbf24' : cat.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {pieData.length > 0 ? (
              <div className="card p-4">
                <p className="text-xs text-text-muted mb-3">Расходы по категориям</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {pieData.map(d => (
                      <div key={d.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-xs text-text-secondary">{getCat(d.id, 'expense').icon} {d.name}</span>
                        </div>
                        <span className="text-xs font-mono text-text-primary">{formatMoney(d.value)} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-text-muted text-sm">Нет расходов за этот период</div>
            )}

            {dayData.length > 0 && (
              <div className="card p-4">
                <p className="text-xs text-text-muted mb-3">По дням</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={dayData} barSize={8}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#44445a' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e30', borderRadius: 8, fontSize: 11 }}
                      formatter={(v) => [`${formatMoney(v)} ₽`]}
                    />
                    <Bar dataKey="расходы" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="доходы" fill="#22d3a0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {top5.length > 0 && (
              <div className="card p-4">
                <p className="text-xs text-text-muted mb-3">Топ-5 расходов</p>
                <div className="space-y-2">
                  {top5.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-mono w-4">{i + 1}</span>
                      <span className="text-sm">{getCat(t.category, 'expense').icon}</span>
                      <span className="flex-1 text-sm text-text-secondary truncate">{t.comment || getCat(t.category, 'expense').label}</span>
                      <span className="text-sm font-mono text-status-red">−{formatMoney(t.amount)} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-1.5">
            {stats.txs.length === 0 && (
              <p className="text-center text-sm text-text-muted py-8">Нет транзакций</p>
            )}
            {stats.txs.map(tx => {
              const cat = getCat(tx.category, tx.type)
              return (
                <div key={tx.id} className="card p-3 flex items-center gap-3 fade-in">
                  <span className="text-lg">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {tx.comment || cat.label}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(tx.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-medium ${tx.type === 'income' ? 'text-status-green' : 'text-status-red'}`}>
                      {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount)} ₽
                    </span>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 text-text-muted hover:text-status-red"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Добавить транзакцию">
        <div className="space-y-4">
          {/* Income/Expense toggle */}
          <div className="flex rounded-xl overflow-hidden border border-bg-border">
            <button
              onClick={() => setForm(p => ({ ...p, type: 'expense', category: CATEGORIES[0].id }))}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${form.type === 'expense' ? 'bg-status-red/20 text-status-red' : 'text-text-muted'
                }`}
            >
              ↓ Расход
            </button>
            <button
              onClick={() => setForm(p => ({ ...p, type: 'income', category: INCOME_CATEGORIES[0].id }))}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${form.type === 'income' ? 'bg-status-green/20 text-status-green' : 'text-text-muted'
                }`}
            >
              ↑ Доход
            </button>
          </div>

          {/* Amount */}
          <div>
            <input
              className="input-field text-2xl font-mono text-center"
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Категория</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(form.type === 'income' ? INCOME_CATEGORIES : CATEGORIES).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${form.category === cat.id
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-bg-border hover:border-bg-hover'
                    }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[9px] text-text-muted leading-none text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <input
            className="input-field"
            placeholder="Комментарий (необязательно)"
            value={form.comment}
            onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
          />

          <div className="flex gap-2">
            <button onClick={() => setAddModal(false)} className="flex-1 btn-ghost border border-bg-border">
              Отмена
            </button>
            <button onClick={handleAdd} className="flex-1 btn-accent">
              Сохранить
            </button>
          </div>
        </div>
      </Modal>

      {/* Limits Modal */}
      <Modal open={limitsModal} onClose={() => setLimitsModal(false)} title="Лимиты по категориям">
        <div className="space-y-3">
          {CATEGORIES.filter(c => c.id !== 'other').map(cat => (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-lg">{cat.icon}</span>
              <span className="flex-1 text-sm text-text-secondary">{cat.label}</span>
              <input
                type="number"
                className="w-28 bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-right font-mono"
                placeholder="Лимит ₽"
                defaultValue={limits[cat.id] || ''}
                onBlur={e => {
                  const val = Number(e.target.value)
                  if (val > 0) setLimit(cat.id, val)
                }}
              />
            </div>
          ))}
          <button onClick={() => setLimitsModal(false)} className="btn-accent w-full mt-2">
            Готово
          </button>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-base font-bold font-mono ${color}`}>
        {formatMoney(value)}<span className="text-xs font-normal ml-0.5">₽</span>
      </p>
    </div>
  )
}
