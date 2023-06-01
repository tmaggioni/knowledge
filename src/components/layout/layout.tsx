import { type ReactNode } from 'react'

import { EntityBar } from './entitybar'
import Footer from './footer'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='relative flex gap-2'>
        <Sidebar />
        <EntityBar />
        <main className='h-screen w-full'>
          <Navbar />
          {children}
        </main>
      </div>
    </>
  )
}
