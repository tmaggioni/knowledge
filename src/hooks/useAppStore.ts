import { useEffect, useState } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { type ValidationFilterSchema } from '~/components/layout/filtersCashFlow'

type UserSession = {
  id: string
  parent: string
}

type GetFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => void ? K : never
}[keyof T]

type OmittedFunctionKeys<T> = Omit<T, GetFunctionKeys<T>>

type AppStoreState = {
  darkOn: boolean
  setDarkOn: (themeMode: boolean) => void
  entityOpened: boolean
  setEntityOpened: (entityOpened: boolean) => void
  user: UserSession | null
  setUser: (user: UserSession | null) => void
  entitiesSelected: string[]
  setEntitiesSelected: (entitiesSelected: string[]) => void
  filterOpen: boolean
  setFilterOpen: (filterOpen: boolean) => void
  filters: Partial<ValidationFilterSchema>
  setFilters: (filters: Partial<ValidationFilterSchema>) => void
}

const initialStates = {
  entityOpened: false,
  darkOn: false,
  user: null,
  filterOpen: false,
  entitiesSelected: [],
  filters: {},
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      darkOn: false,
      filterOpen: false,
      setFilterOpen: (filterOpen) => set({ filterOpen }),
      setDarkOn: (darkOn) => set({ darkOn }),
      entityOpened: initialStates.entityOpened,
      setEntityOpened: (entityOpened) => set({ entityOpened }),
      user: initialStates.user,
      setUser: (user) => set({ user }),
      entitiesSelected: [],
      setEntitiesSelected: (entitiesSelected) =>
        set({
          entitiesSelected,
        }),
      filters: {
        date: {
          to: new Date(new Date().setHours(0, 0, 0, 0)),
          from: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      setFilters: (filters) =>
        set({
          filters,
        }),
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
