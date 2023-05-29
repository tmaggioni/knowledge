import Link from 'next/link'

import {
  LayoutGrid,
  Library,
  ListMusic,
  Mic2,
  Music2,
  Radio,
  User,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('max-w-[250px] border-r-2', className)}>
      <div className='space-y-4 py-4'>
        <div className='px-4 py-2'>
          <h2 className='mb-2 px-2 text-lg font-semibold tracking-tight'>
            Knowledge
          </h2>
          <div className='space-y-1'>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <LayoutGrid className='mr-2 h-4 w-4' />
              <Link href='/dashboard/users'>Login</Link>
            </Button>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <Radio className='mr-2 h-4 w-4' />
              Radio
            </Button>
          </div>
        </div>
        <div className='px-4 py-2'>
          <h2 className='mb-2 px-2 text-lg font-semibold tracking-tight'>
            Library
          </h2>
          <div className='space-y-1'>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <ListMusic className='mr-2 h-4 w-4' />
              Playlists
            </Button>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <Music2 className='mr-2 h-4 w-4' />
              Songs
            </Button>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <User className='mr-2 h-4 w-4' />
              Made for You
            </Button>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <Mic2 className='mr-2 h-4 w-4' />
              Artists
            </Button>
            <Button variant='ghost' size='sm' className='w-full justify-start'>
              <Library className='mr-2 h-4 w-4' />
              Albums
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
