import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full bg-bg-card border border-bg-border rounded-t-2xl slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border flex-shrink-0">
          <h3 className="font-semibold text-text-primary text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto pb-32">
          {children}
        </div>
      </div>
    </div>
  )
}
