import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UserSession = {
  id: string
  parent: string
}

interface AppStoreState {
  user: UserSession | null
  setUser: (user: UserSession | null) => void
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
