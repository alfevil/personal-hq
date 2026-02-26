import React from 'react'
import { getUserId } from '../lib/supabase'
import { Shield, Database, BrainCircuit, FolderGit2, Wallet } from 'lucide-react'
import { useThoughts } from '../hooks/useThoughts'
import { useProjects } from '../hooks/useProjects'
import { useBudget } from '../hooks/useBudget'

const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

export default function Settings() {
  const userId = getUserId()
  const { thoughts } = useThoughts()
  const { projects } = useProjects()
  const { getMonthStats } = useBudget()

  const activeProjectsCount = projects.filter(p => p.status === 'active').length
  const now = new Date()
  const { balance } = getMonthStats(now.getFullYear(), now.getMonth())

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-text-primary">⚙️ Настройки</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">

        {/* User info */}
        {tgUser && (
          <div className="card p-4">
            <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">Аккаунт</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                {tgUser.first_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {tgUser.first_name} {tgUser.last_name || ''}
                </p>
                <p className="text-xs text-text-muted">@{tgUser.username || 'нет юзернейма'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats info */}
        <div className="card p-4">
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">Моя Статистика</p>
          <div className="space-y-2">
            <InfoRow icon={<BrainCircuit size={14} className="text-accent" />} label="Всего мыслей" value={thoughts.length} />
            <InfoRow icon={<FolderGit2 size={14} className="text-status-green" />} label="Активных проектов" value={activeProjectsCount} />
            <InfoRow icon={<Wallet size={14} className="text-status-yellow" />} label="Баланс за месяц" value={`${new Intl.NumberFormat('ru-RU').format(balance || 0)} ₽`} />
          </div>
        </div>

        {/* Tech info */}
        <div className="card p-4">
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">Техническое</p>
          <div className="space-y-2">
            <InfoRow icon={<Shield size={14} />} label="User ID" value={userId} mono />
            <InfoRow icon={<Database size={14} />} label="База данных" value="Supabase" />
          </div>
        </div>

        {/* About */}
        <div className="card p-4">
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">О приложении</p>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <span className="text-text-primary font-medium">Personal HQ</span> — личный штаб.
              Мысли, проекты, бюджет в одном месте.
            </p>
            <p className="text-xs text-text-muted">
              Сделано на React + Supabase. Твои данные хранятся только в твоей БД Supabase.
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-text-muted pb-4">
          Personal HQ v1.0.1
        </p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm text-text-secondary ${mono ? 'font-mono text-xs' : ''} truncate max-w-[180px]`}>
        {value}
      </span>
    </div>
  )
}
