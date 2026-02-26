import { useState, useEffect, useCallback } from 'react'
import { supabase, getUserId } from '../lib/supabase'

export const CATEGORIES = [
  { id: 'food', label: 'Еда', icon: '🍔', color: '#f97316' },
  { id: 'transport', label: 'Транспорт', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', label: 'Покупки', icon: '🛍️', color: '#a855f7' },
  { id: 'business', label: 'Бизнес/Проекты', icon: '💼', color: '#6366f1' },
  { id: 'subs', label: 'Подписки', icon: '📱', color: '#06b6d4' },
  { id: 'fun', label: 'Развлечения', icon: '🎮', color: '#ec4899' },
  { id: 'other', label: 'Другое', icon: '📦', color: '#6b7280' },
]

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Основная работа', icon: '💰', color: '#22c55e' },
  { id: 'parttime', label: 'Подработка', icon: '⏱️', color: '#3b82f6' },
  { id: 'business_inc', label: 'Бизнес', icon: '💼', color: '#8b5cf6' },
  { id: 'bonus', label: 'Премия', icon: '🎉', color: '#f59e0b' },
  { id: 'gift', label: 'Подарок/ДР', icon: '🎁', color: '#ec4899' },
  { id: 'other_inc', label: 'Другое', icon: '💵', color: '#6b7280' },
]

export const getCat = (id, type = 'expense') => {
  if (type === 'income') {
    return INCOME_CATEGORIES.find(c => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1]
  }
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

export function useBudget() {
  const [transactions, setTransactions] = useState([])
  const [limits, setLimits] = useState({})
  const [loading, setLoading] = useState(true)
  const userId = getUserId()

  const fetch = useCallback(async () => {
    const [txRes, limRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('budget_limits').select('*').eq('user_id', userId),
    ])
    if (txRes.data) setTransactions(txRes.data)
    if (limRes.data) {
      const map = {}
      limRes.data.forEach(l => { map[l.category] = l.amount })
      setLimits(map)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const addTransaction = async (tx) => {
    const { data } = await supabase.from('transactions').insert({
      user_id: userId, ...tx, date: tx.date || new Date().toISOString()
    }).select().single()
    if (data) setTransactions(prev => [data, ...prev])
  }

  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const setLimit = async (category, amount) => {
    await supabase.from('budget_limits').upsert({
      user_id: userId, category, amount
    }, { onConflict: 'user_id,category' })
    setLimits(prev => ({ ...prev, [category]: amount }))
  }

  // Helpers
  const getMonthTransactions = (year, month) =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

  const getMonthStats = (year, month) => {
    const txs = getMonthTransactions(year, month)
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expense, balance: income - expense, txs }
  }

  const getCategorySpend = (year, month) => {
    const { txs } = getMonthStats(year, month)
    const map = {}
    txs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount)
    })
    return map
  }

  return {
    transactions, limits, loading, fetch,
    addTransaction, deleteTransaction, setLimit,
    getMonthStats, getCategorySpend,
  }
}
