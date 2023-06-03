import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { MoonStar, User } from 'lucide-react'

import { useAppStore, useHydratedStore } from '~/hooks/useAppStore'
import { useOnClickOutside } from '~/hooks/useClickOutside'
import { api } from '~/utils/api'

export const Navbar = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const router = useRouter()
  const darkOn = useHydratedStore('darkOn')
  const setUser = useAppStore((state) => state.setUser)
  const setEntitiesSelected = useAppStore((state) => state.setEntitiesSelected)
  const setDarkOn = useAppStore((state) => state.setDarkOn)

  useOnClickOutside(ref, () => setOpen(false))
  const { mutate: logout } = api.auth.logout.useMutation()

  useEffect(() => {
    if (darkOn) {
      document?.querySelector('html')?.classList?.add('dark')
    } else {
      document?.querySelector('html')?.classList?.remove('dark')
    }
  }, [darkOn])
  return (
    <nav className=''>
      <div className='mx-auto box-border w-full px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 w-full items-center justify-end'>
          <div className='relative ml-3 flex items-center gap-1'>
            <button
              type='button'
              className='flex rounded-full bg-slate-400 p-1 text-sm '
              id='user-menu-button'
              aria-expanded='false'
              aria-haspopup='true'
              onClick={() => setDarkOn(!darkOn)}
            >
              <MoonStar />
            </button>
            <button
              type='button'
              className='flex rounded-full bg-slate-400 p-1 text-sm '
              id='user-menu-button'
              aria-expanded='false'
              aria-haspopup='true'
              onClick={() => setOpen(!open)}
            >
              <User color='#FFF' />
            </button>

            <div
              ref={ref}
              className={`${
                !open ? 'hidden' : ''
              } absolute  right-0 top-6 z-10 mt-2 w-48  origin-top-right py-1  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-primary`}
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='user-menu-button'
            >
              <button
                className='block px-4 py-2 text-sm text-gray-700'
                role='menuitem'
                id='user-menu-item-2'
                onClick={() => {
                  logout(undefined, {
                    onSuccess: () => {
                      setUser(null)
                      setEntitiesSelected([])
                      void router.push('/login')
                    },
                  })
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
