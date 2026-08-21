import { create } from 'zustand'
import type { ToastNotification, ToastTone } from '@/types/ui'

interface ToastState {
  toasts: ToastNotification[]
  showToast: (tone: ToastTone, title: string, description?: string) => void
  dismissToast: (id: string) => void
}

function generateId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (tone, title, description) => {
    const id = generateId()
    const toast: ToastNotification = {
      id,
      title,
      description,
      tone,
      duration: 3000,
    }
    set((state) => ({ toasts: [...state.toasts, toast] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, toast.duration)
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().showToast('success', title, description),
  error: (title: string, description?: string) =>
    useToastStore.getState().showToast('error', title, description),
  warning: (title: string, description?: string) =>
    useToastStore.getState().showToast('warning', title, description),
  info: (title: string, description?: string) =>
    useToastStore.getState().showToast('info', title, description),
}
