import { type User } from '@prisma/client'
import { type ColumnDef } from '@tanstack/react-table'
import { Loader } from 'lucide-react'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import { DialogCreateUser } from '~/components/pages/users/dialogCreate'
import { DialogPermissions } from '~/components/pages/users/dialogPermissions'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { MyDeleteIcon } from '~/components/ui/mydeleteIcon'
import { api } from '~/utils/api'

const Users = () => {
  const { data: users, isLoading, isFetching } = api.user.getAll.useQuery()
  const { mutate: removeUser, isLoading: isLoadingRemove } =
    api.user.remove.useMutation()
  const utils = api.useContext()

  const handleRemoveUser = (id: string) => {
    removeUser(
      { id },
      {
        onSuccess: (data) => {
          toast(`Usuário ${data.email} removido com sucesso`, {
            type: 'success',
          })
          void utils.user.getAll.invalidate()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

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
            <DialogPermissions userId={user.id} />
            <Button
              disabled={isLoadingRemove}
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => handleRemoveUser(user.id)}
            >
              <MyDeleteIcon size={20} color={'hsl(var(--destructive))'} />
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
        <div className='flex flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
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
