import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { type User } from '@prisma/client'
import { type ColumnDef } from '@tanstack/react-table'
import { DeleteIcon, Edit, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Layout from '~/components/layout/layout'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { api } from '~/utils/api'

import { DialogCreateUser } from './dialogCreate'

const Users = () => {
  const { data: users, isLoading, isFetching } = api.user.getUsers.useQuery()

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      accessorKey: 'actions',
      header: () => <div className='text-right'>{'Editar/Deletar'}</div>,
      cell: ({ row }) => {
        const user = row.original

        return (
          <div className='text-right'>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => alert(user.email)}
            >
              <Edit size={20} />
            </Button>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <DeleteIcon size={20} color={'hsl(var(--destructive))'} />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <Layout>
      <>
        <Breadcrumb
          links={[
            { label: 'Dashboard', link: '/dashboard' },
            { label: 'Usuários' },
          ]}
        />
        <div className='flex max-w-[50%] flex-col items-start gap-2'>
          <div className='flex gap-2'>
            <DialogCreateUser />
            {(isLoading || isFetching) && (
              <Loader className='mr-2 h-4 w-4 animate-spin' />
            )}
          </div>

          {!isLoading && (
            <DataTable columns={columns} data={users ? users : []} />
          )}
        </div>
      </>
    </Layout>
  )
}

export default Users
