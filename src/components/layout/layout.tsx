import { type ReactNode } from 'react'

import Footer from './footer'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='flex gap-2'>
        <Sidebar />
        <main className='h-screen w-full'>
          <Navbar />
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}
