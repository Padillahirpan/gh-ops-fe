import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FontSizePreset, Theme } from '@/types/ui'
import { STORAGE_KEYS } from '@/constants/storageKeys'

interface UIState {
  theme: Theme
  fontSize: FontSizePreset
  sidebarOpen: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setFontSize: (preset: FontSizePreset) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.classList.add('theme-transition')
  html.setAttribute('data-theme', theme)
  window.setTimeout(() => html.classList.remove('theme-transition'), 250)
}

export function applyFontSizeToDocument(preset: FontSizePreset): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.classList.remove('font-size-small', 'font-size-medium', 'font-size-large')
  html.classList.add(`font-size-${preset}`)
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.matchMedia('(prefers-color-scheme: dark)')
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return stored.matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      fontSize: 'medium',
      sidebarOpen: false,

      setTheme: (theme) => {
        applyThemeToDocument(theme)
        set({ theme })
      },

      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light'
        applyThemeToDocument(next)
        set({ theme: next })
      },

      setFontSize: (preset) => {
        applyFontSizeToDocument(preset)
        set({ fontSize: preset })
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: STORAGE_KEYS.uiPreferences,
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDocument(state.theme)
          applyFontSizeToDocument(state.fontSize)
        }
      },
    },
  ),
)
