import { useState, useEffect, useCallback } from 'react'
import { supabase, getUserId } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = getUserId()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        stages:project_stages(*),
        tasks:project_tasks(*),
        notes:project_notes(*),
        links:project_links(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const addProject = async (project) => {
    const { data, error } = await supabase.from('projects').insert({
      user_id: userId,
      ...project,
    }).select().single()
    if (!error && data) {
      setProjects(prev => [{ ...data, stages: [], tasks: [], notes: [], links: [] }, ...prev])
      return data
    }
  }

  const updateProject = async (id, updates) => {
    await supabase.from('projects').update(updates).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProject = async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // Stages
  const addStage = async (projectId, name) => {
    const project = projects.find(p => p.id === projectId)
    const order = (project?.stages?.length || 0)
    const { data } = await supabase.from('project_stages').insert({
      project_id: projectId, name, status: 'todo', order
    }).select().single()
    if (data) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, stages: [...(p.stages || []), data] } : p
      ))
    }
  }

  const updateStage = async (projectId, stageId, updates) => {
    await supabase.from('project_stages').update(updates).eq('id', stageId)
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, stages: p.stages.map(s => s.id === stageId ? { ...s, ...updates } : s) }
        : p
    ))
  }

  const deleteStage = async (projectId, stageId) => {
    await supabase.from('project_stages').delete().eq('id', stageId)
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, stages: p.stages.filter(s => s.id !== stageId) } : p
    ))
  }

  // Tasks
  const addTask = async (projectId, stageId, title, deadline = null) => {
    const { data } = await supabase.from('project_tasks').insert({
      project_id: projectId, stage_id: stageId, title, done: false, deadline
    }).select().single()
    if (data) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, tasks: [...(p.tasks || []), data] } : p
      ))
    }
  }

  const toggleTask = async (projectId, taskId, done) => {
    await supabase.from('project_tasks').update({ done: !done }).eq('id', taskId)
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !done } : t) }
        : p
    ))
  }

  const deleteTask = async (projectId, taskId) => {
    await supabase.from('project_tasks').delete().eq('id', taskId)
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
    ))
  }

  // Notes
  const addNote = async (projectId, content) => {
    const { data } = await supabase.from('project_notes').insert({
      project_id: projectId, content
    }).select().single()
    if (data) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, notes: [...(p.notes || []), data] } : p
      ))
    }
  }

  const deleteNote = async (projectId, noteId) => {
    await supabase.from('project_notes').delete().eq('id', noteId)
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, notes: p.notes.filter(n => n.id !== noteId) } : p
    ))
  }

  // Links
  const addLink = async (projectId, title, url) => {
    const { data } = await supabase.from('project_links').insert({
      project_id: projectId, title, url
    }).select().single()
    if (data) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, links: [...(p.links || []), data] } : p
      ))
    }
  }

  const deleteLink = async (projectId, linkId) => {
    await supabase.from('project_links').delete().eq('id', linkId)
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, links: p.links.filter(l => l.id !== linkId) } : p
    ))
  }

  return {
    projects, loading, fetch,
    addProject, updateProject, deleteProject,
    addStage, updateStage, deleteStage,
    addTask, toggleTask, deleteTask,
    addNote, deleteNote,
    addLink, deleteLink,
  }
}

export function calcProgress(project) {
  const tasks = project.tasks || []
  if (!tasks.length) return 0
  return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
}
