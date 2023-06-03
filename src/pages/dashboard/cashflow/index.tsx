import { useMemo, useState } from 'react'

import { type CashFlow } from '@prisma/client'
import { type ColumnDef, type PaginationState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Loader } from 'lucide-react'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import DialogCreateCashFlow from '~/components/pages/cashFlow/dialogCreate'
import { DialogEditCashFlow } from '~/components/pages/cashFlow/dialogEdit'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { MyDeleteIcon } from '~/components/ui/mydeleteIcon'
import { useHydratedStore } from '~/hooks/useAppStore'
import { api } from '~/utils/api'

const CashFlow = () => {
  const entitiesSelected = useHydratedStore('entitiesSelected')
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
    data: cashFlowResponse,
    isLoading,
    isFetching,
  } = api.cashFlow.getAll.useQuery({
    entityIds: entitiesSelected || [],
    pageIndex,
    pageSize,
  })
  const { mutate: removeCashFlow, isLoading: isLoadingRemove } =
    api.category.remove.useMutation()
  const utils = api.useContext()

  const handleRemoveCashFlow = (id: string) => {
    removeCashFlow(
      { id },
      {
        onSuccess: (data) => {
          toast(`Registro ${data.name} removido com sucesso`, {
            type: 'success',
          })
          void utils.cashFlow.getAll.invalidate()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

  const columns: ColumnDef<
    CashFlow & {
      category: {
        name: string
      }
    }
  >[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
    },
    {
      accessorKey: 'type',
      header: 'Tipo pagamento',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => {
        const cashFlow = row.original

        return <>{cashFlow.category.name}</>
      },
    },
    {
      accessorKey: 'typeFlow',
      header: 'Receita/Despesa',
      cell: ({ row }) => {
        const cashFlow = row.original

        return (
          <>
            {cashFlow.typeFlow === 'income' && 'Receita'}
            {cashFlow.typeFlow === 'expense' && 'Despesa'}
          </>
        )
      },
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => {
        const cashFlow = row.original

        return <>{format(cashFlow.date, 'dd/MM/yyyy')}</>
      },
    },
    {
      accessorKey: 'actions',
      header: () => <div className='text-right'>{'Editar/Deletar'}</div>,
      cell: ({ row }) => {
        const cashFlow = row.original

        return (
          <div className='text-right'>
            <DialogEditCashFlow cashFlowId={cashFlow.id} />
            <Button
              disabled={isLoadingRemove}
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => handleRemoveCashFlow(cashFlow.id)}
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
            { label: 'Entradas/saidas' },
          ]}
        />
        <div className='flex max-w-[50%] flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            <DialogCreateCashFlow />
            {(isLoading || isFetching) && (
              <Loader className='mr-2 h-4 w-4 animate-spin' />
            )}
          </div>

          {!isLoading && (
            <>
              <DataTable
                columns={columns}
                data={
                  cashFlowResponse?.cashFlow ? cashFlowResponse.cashFlow : []
                }
                pagination={pagination}
                hasPagination={true}
                setPagination={setPagination}
                total={cashFlowResponse?.total}
              />
            </>
          )}
        </div>
      </>
    </Layout>
  )
}

export default CashFlow
