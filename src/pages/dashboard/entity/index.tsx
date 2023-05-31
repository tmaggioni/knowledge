import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { type Entity } from '@prisma/client'
import { type ColumnDef } from '@tanstack/react-table'
import { DeleteIcon, Edit, Loader } from 'lucide-react'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { api } from '~/utils/api'

import { DialogCreateEntity } from './dialogCreate'
import { DialogEditEntity } from './dialogEdit'

const Users = () => {
  const { data: entities, isLoading, isFetching } = api.entity.getAll.useQuery()
  const { mutate: removeEntity, isLoading: isLoadingRemove } =
    api.entity.remove.useMutation()
  const utils = api.useContext()

  const handleRemoveEntity = (id: string) => {
    removeEntity(
      { id },
      {
        onSuccess: (data) => {
          toast(`Entidade ${data.name} removida com sucesso`, {
            type: 'success',
          })
          void utils.entity.getAll.invalidate()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

  const columns: ColumnDef<Entity>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
    },
    {
      accessorKey: 'actions',
      header: () => <div className='text-right'>{'Editar/Deletar'}</div>,
      cell: ({ row }) => {
        const entity = row.original

        return (
          <div className='text-right'>
            <DialogEditEntity entityId={entity.id} />
            <Button
              disabled={isLoadingRemove}
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => handleRemoveEntity(entity.id)}
            >
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
            { label: 'Entidades' },
          ]}
        />
        <div className='flex max-w-[50%] flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            <DialogCreateEntity />
            {(isLoading || isFetching) && (
              <Loader className='mr-2 h-4 w-4 animate-spin' />
            )}
          </div>

          {!isLoading && (
            <DataTable columns={columns} data={entities ? entities : []} />
          )}
        </div>
      </>
    </Layout>
  )
}

export default Users
