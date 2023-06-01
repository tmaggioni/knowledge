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
  const setEntityOpened = useAppStore((state) => state.setEntityOpened)

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
        `box-borderborder-r-2 absolute top-0 z-20 h-screen w-full max-w-[230px]  bg-white ${
          entityOpened ? 'left-0' : '-left-[100%]'
        } transition-all duration-300`,
        className,
      )}
    >
      <div className='flex w-full flex-col items-end '>
        <div className='pr-4 pt-4'>
          <CopyX
            className='mb-5 cursor-pointer'
            onClick={() => {
              setEntityOpened(false)
            }}
          />
        </div>
        {isAdmin &&
          entities?.entitiesParent?.map((item) => (
            <div
              className='flex h-14 w-full cursor-pointer items-center justify-center bg-[#ccc] transition-all'
              key={item.id}
            >
              {item.name}
            </div>
          ))}
        {!isAdmin &&
          entities?.entitiesUsers?.map((item) => (
            <Button key={item.entity.id}>{item.entity.name}</Button>
          ))}
      </div>
    </div>
  )
}
