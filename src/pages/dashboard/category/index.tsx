import { useMemo, useState } from 'react'

import { type Category } from '@prisma/client'
import { type ColumnDef, type PaginationState } from '@tanstack/react-table'
import { Loader } from 'lucide-react'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import DialogCreateCategory from '~/components/pages/categories/dialogCreate'
import { DialogEditCategory } from '~/components/pages/categories/dialogEdit'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { MyDeleteIcon } from '~/components/ui/mydeleteIcon'
import { api } from '~/utils/api'

const Category = () => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  const {
    data: categorieResponse,
    isLoading,
    isFetching,
  } = api.category.getAll.useQuery({ pageIndex, pageSize })
  const { mutate: removeCategory, isLoading: isLoadingRemove } =
    api.category.remove.useMutation()
  const utils = api.useContext()

  const handleRemoveCategory = (id: string) => {
    removeCategory(
      { id },
      {
        onSuccess: (data) => {
          toast(`Entidade ${data.name} removida com sucesso`, {
            type: 'success',
          })
          void utils.category.getAll.invalidate()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

  const columns: ColumnDef<Category>[] = [
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
        const category = row.original

        return (
          <div className='text-right'>
            <DialogEditCategory categoryId={category.id} />
            <Button
              disabled={isLoadingRemove}
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => handleRemoveCategory(category.id)}
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
            { label: 'Categorias' },
          ]}
        />
        <div className='flex max-w-[50%] flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            <DialogCreateCategory />
            {(isLoading || isFetching) && (
              <Loader className='mr-2 h-4 w-4 animate-spin' />
            )}
          </div>

          {!isLoading && (
            <>
              <DataTable
                columns={columns}
                data={
                  categorieResponse?.categories
                    ? categorieResponse.categories
                    : []
                }
                pagination={pagination}
                hasPagination={true}
                setPagination={setPagination}
                total={categorieResponse?.total}
              />
            </>
          )}
        </div>
      </>
    </Layout>
  )
}

export default Category
