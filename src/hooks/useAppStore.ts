import { useEffect, useState } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UserSession = {
  id: string
  parent: string
}

type GetFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => void ? K : never
}[keyof T]

type OmittedFunctionKeys<T> = Omit<T, GetFunctionKeys<T>>

type AppStoreState = {
  entityOpened: boolean
  setEntityOpened: (entityOpened: boolean) => void
  user: UserSession | null
  setUser: (user: UserSession | null) => void
}

const initialStates = {
  entityOpened: false,
  user: null,
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      entityOpened: initialStates.entityOpened,
      setEntityOpened: (entityOpened) => set({ entityOpened }),
      user: initialStates.user,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export const useHydratedStore = <
  T extends keyof OmittedFunctionKeys<AppStoreState>,
>(
  key: T,
): OmittedFunctionKeys<AppStoreState>[T] => {
  const [state, setState] = useState<OmittedFunctionKeys<AppStoreState>[T]>(
    initialStates[key],
  )
  const zustandState = useAppStore((persistedState) => persistedState[key])

  useEffect(() => {
    setState(zustandState as OmittedFunctionKeys<AppStoreState>[T])
  }, [zustandState])

  return state
}
