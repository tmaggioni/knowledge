import Link from 'next/link'

import { User } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useAppStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const user = useAppStore((state) => state.user)

  return (
    <div className={cn('max-w-[250px] border-r-2', className)}>
      <div className='space-y-4 py-4'>
        <div className='px-4 py-2'>
          <h2 className='mb-2 px-2 text-lg font-semibold tracking-tight'>
            Knowledge
          </h2>
          <div className='space-y-1'>
            {user && !user.parent && (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
