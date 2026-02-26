import { useState, useEffect, useCallback } from 'react'
import { supabase, getUserId } from '../lib/supabase'

function parseTags(text) {
  const matches = text.match(/#[\w\u0400-\u04FF]+/g)
  return matches ? matches.map(t => t.slice(1).toLowerCase()) : []
}

export function useThoughts() {
  const [thoughts, setThoughts] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = getUserId()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) setThoughts(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const add = async (content) => {
    const tags = parseTags(content)
    const { data, error } = await supabase.from('thoughts').insert({
      user_id: userId,
      content,
      tags,
      pinned: false,
    }).select().single()
    if (!error && data) setThoughts(prev => [data, ...prev])
  }

  const remove = async (id) => {
    await supabase.from('thoughts').delete().eq('id', id)
    setThoughts(prev => prev.filter(t => t.id !== id))
  }

  const togglePin = async (id, pinned) => {
    await supabase.from('thoughts').update({ pinned: !pinned }).eq('id', id)
    setThoughts(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, pinned: !pinned } : t)
      return [...updated].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at) - new Date(a.created_at)
      })
    })
  }

  return { thoughts, loading, add, remove, togglePin, refresh: fetch }
}
