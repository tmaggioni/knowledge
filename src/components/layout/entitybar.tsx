import Link from 'next/link'

import { CopyX, User } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useAppStore, useHydratedStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

import { MyLoader } from '../ui/myloader'

export function EntityBar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const user = useHydratedStore('user')
  const entityOpened = useHydratedStore('entityOpened')
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const setEntityOpened = useAppStore((state) => state.setEntityOpened)
  const setEntitiesSelected = useAppStore((state) => state.setEntitiesSelected)

  const isAdmin = !Boolean(user?.parent)

  const { data: entities, isLoading } = api.entity.getAllByUser.useQuery()

  // if (!entityOpened) {
  //   return null
  // }

  if (isLoading) {
    return <MyLoader />
  }
  return (
    <div
      className={cn(
        `absolute z-10 h-auto w-full max-w-[230px]  bg-background ${
          entityOpened ? 'left-0' : '-left-[100%]'
        } top-[12px] z-20 h-screen transition-all duration-300`,
        className,
      )}
    >
      <div className=' space-y-4 py-4'>
        <div className='flex flex-col gap-1 px-4 py-2'>
          <h2 className='mb-5 flex w-full items-center justify-between gap-2 px-2 text-lg font-semibold tracking-tight'>
            Entidades
            <CopyX
              className='cursor-pointer'
              onClick={() => {
                setEntityOpened(false)
              }}
            />
          </h2>

          {isAdmin &&
            entities?.entitiesParent?.map((item) => (
              <Button
                key={item.id}
                variant={
                  entitiesSelected.includes(item.id) ? 'default' : 'ghost'
                }
                size='sm'
                onClick={() => setEntitiesSelected(item.id)}
                className='w-full justify-start'
              >
                <User className='mr-2 h-4 w-4' />
                {item.name}
              </Button>
            ))}
          {!isAdmin &&
            entities?.entitiesUsers?.map((item) => (
              <Button
                variant={
                  entitiesSelected.includes(item.entity.id)
                    ? 'default'
                    : 'ghost'
                }
                size='sm'
                onClick={() => setEntitiesSelected(item.entity.id)}
                key={item.entity.id}
              >
                {item.entity.name}
              </Button>
            ))}
        </div>
      </div>
    </div>
  )
}
