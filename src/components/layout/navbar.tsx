import { useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { User } from 'lucide-react'

import { useAppStore } from '~/hooks/useAppStore'
import { useOnClickOutside } from '~/hooks/useClickOutside'
import { api } from '~/utils/api'

export const Navbar = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)
  useOnClickOutside(ref, () => setOpen(false))
  const { mutate: logout } = api.auth.logout.useMutation()
  return (
    <nav className='bg-primary'>
      <div className='mx-auto  w-full px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 w-full items-center justify-between'>
          <div className='absolute right-0 flex items-center pr-2'>
            <div className='relative ml-3'>
              <div>
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
              </div>

              <div
                ref={ref}
                className={`${
                  !open ? 'hidden' : ''
                } absolute right-0 z-10 mt-2  w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
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
      </div>
    </nav>
  )
}
