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
                <Link href='/dashboard/users'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                  >
                    <User className='mr-2 h-4 w-4' />
                    Usuários
                  </Button>
                </Link>
                <Link href='/dashboard/entity'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                  >
                    <User className='mr-2 h-4 w-4' />
                    Entidades
                  </Button>
                </Link>
                <Link href='/dashboard/category'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                  >
                    <User className='mr-2 h-4 w-4' />
                    Categorias
                  </Button>
                </Link>
              </>
            )}
            <Link href='/dashboard/cashflow'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start'
              >
                <User className='mr-2 h-4 w-4' />
                Receitas/Despesas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
