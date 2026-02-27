import React, { useState } from 'react'
import Navigation from './components/Navigation'
import Thoughts from './pages/Thoughts'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Budget from './pages/Budget'
import Settings from './pages/Settings'
import { useProjects } from './hooks/useProjects'

export default function App() {
  const [tab, setTab] = useState('thoughts')
  const [selectedProject, setSelectedProject] = useState(null)

  const projectHooks = useProjects()

  const handleTabChange = (newTab) => {
    setTab(newTab)
    if (newTab !== 'projects') setSelectedProject(null)
  }

  const handleSelectProject = (project) => {
    // Find latest version of project from store
    const fresh = projectHooks.projects.find(p => p.id === project.id) || project
    setSelectedProject(fresh)
  }

  const handleMoveToProject = async (thought, projectId) => {
    // Add as a free task to the selected project
    await projectHooks.addTask(projectId, null, thought.content)
    // Remove the thought after moving (we need useThoughts hook to do this cleanly, 
    // but Thoughts component already has remove() and we can just call it there, 
    // or we can pass a callback back.
    // Instead, better to just let App handle the hook import or pass handleMoveToProject.
    // Wait, useThoughts is inside the Thoughts component.
  }

  // Keep selectedProject in sync with store
  const liveProject = selectedProject
    ? projectHooks.projects.find(p => p.id === selectedProject.id) || selectedProject
    : null

  return (
    <div className="h-full flex flex-col bg-bg-base overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto">
          {tab === 'thoughts' && (
            <Thoughts
              projects={projectHooks.projects}
              onMoveToProject={handleMoveToProject}
            />
          )}

          {tab === 'projects' && !liveProject && (
            <Projects
              projects={projectHooks.projects}
              loading={projectHooks.loading}
              addProject={projectHooks.addProject}
              onSelectProject={handleSelectProject}
            />
          )}

          {tab === 'projects' && liveProject && (
            <ProjectDetail
              project={liveProject}
              onBack={() => setSelectedProject(null)}
              hooks={projectHooks}
            />
          )}

          {tab === 'budget' && <Budget />}
          {tab === 'settings' && <Settings />}
        </div>
      </div>

      <Navigation active={tab} onChange={handleTabChange} />
    </div>
  )
}
