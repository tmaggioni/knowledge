import { Fragment } from 'react'

import Link from 'next/link'

interface Props {
  links: {
    label: string
    link?: string
  }[]
}
export const Breadcrumb = ({ links }: Props) => {
  return (
    <nav
      className='relative mb-3 flex w-full flex-wrap items-center justify-between bg-primary py-3 text-neutral-500 shadow-md hover:text-neutral-700 focus:text-neutral-700 dark:bg-neutral-600 lg:flex-wrap lg:justify-start'
      data-te-navbar-ref
    >
      <div className='flex w-full flex-wrap items-center justify-between px-3'>
        <nav
          className='bg-grey-light w-full rounded-md'
          aria-label='breadcrumb'
        >
          <ul className='list-reset flex'>
            {links.map((item, index) => (
              <Fragment key={item.label}>
                <li>
                  <Link
                    href={item.link ? item.link : '#'}
                    className='text-neutral-500 hover:text-neutral-600 dark:text-neutral-200'
                  >
                    {item.label}
                  </Link>
                </li>

                {index !== links.length - 1 && (
                  <li>
                    <span className='mx-2 text-neutral-500 dark:text-neutral-200'>
                      /
                    </span>
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </nav>
  )
}
