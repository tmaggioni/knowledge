import Link from 'next/link'

import { MenuIcon, User } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useAppStore, useHydratedStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const user = useHydratedStore('user')
  const setEntityOpened = useAppStore((state) => state.setEntityOpened)

  const isAdmin = !Boolean(user?.parent)

  return (
    <div className={cn('relative z-10 w-full max-w-[230px]', className)}>
      <div className='space-y-4 py-4'>
        <div className='px-4 py-2'>
          <h2 className='mb-2 flex w-full items-center justify-between gap-2 px-2 text-lg font-semibold tracking-tight'>
            Knowledge
            <MenuIcon
              className='cursor-pointer'
              onClick={() => {
                setEntityOpened(true)
              }}
            />
          </h2>

          <div className='space-y-1'>
            {isAdmin && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                >
                  <User className='mr-2 h-4 w-4' />
                  <Link href='/dashboard/users'>Usuários</Link>
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                >
                  <User className='mr-2 h-4 w-4' />
                  <Link href='/dashboard/entity'>Entidades</Link>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                >
                  <User className='mr-2 h-4 w-4' />
                  <Link href='/dashboard/category'>Categorias</Link>
                </Button>
              </>
            )}
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <User className='mr-2 h-4 w-4' />
              <Link href='/dashboard/cashflow'>Receitas/Despesas</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
