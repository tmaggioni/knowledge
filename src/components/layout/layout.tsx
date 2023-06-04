import { type ReactNode } from 'react'

import { EntityBar } from './entitybar'
import { FiltersCashFlow } from './filtersCashFlow'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='relative flex gap-2'>
        <Sidebar />
        <EntityBar />
        <main className='relative h-screen w-full'>
          <FiltersCashFlow />
          <Navbar />
          {children}
        </main>
      </div>
    </>
  )
}
