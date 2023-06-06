import { useMemo, useState } from 'react'

import {
  type CashFlow,
  StatusFlow,
  TypeFlow,
  TypePayment,
} from '@prisma/client'
import { type ColumnDef, type PaginationState } from '@tanstack/react-table'
import { format, isBefore } from 'date-fns'
import { AlertTriangle, Loader } from 'lucide-react'
import { NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import DialogCreateCashFlow from '~/components/pages/cashFlow/dialogCreate'
import { DialogEditCashFlow } from '~/components/pages/cashFlow/dialogEdit'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button, buttonVariants } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { MyDeleteIcon } from '~/components/ui/mydeleteIcon'
import { MyLoader } from '~/components/ui/myloader'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { useAppStore, useHydratedStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

interface PropsConfirmDelete {
  cashFlowId: string
}
const ActionsCashFlow = ({ cashFlowId }: PropsConfirmDelete) => {
  const [open, setOpen] = useState(false)
  const { mutateAsync: removeCashFlow, isLoading: isLoadingRemove } =
    api.cashFlow.remove.useMutation()
  const utils = api.useContext()

  const handleRemoveCashFlow = async () => {
    return await removeCashFlow(
      { id: cashFlowId },
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
  return (
    <div className='text-right'>
      <DialogEditCashFlow cashFlowId={cashFlowId} />
      <Button
        disabled={isLoadingRemove}
        variant='ghost'
        className='h-8 w-8 p-0'
        onClick={() => setOpen(true)}
      >
        <MyDeleteIcon size={20} color={'hsl(var(--destructive))'} />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              disabled={isLoadingRemove}
              variant='default'
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'mt-2 flex items-center gap-1 bg-destructive sm:mt-0 ',
              )}
              onClick={async (e) => {
                e.preventDefault()
                console.log('eita')
                await handleRemoveCashFlow()
                setOpen(false)
              }}
            >
              Deletar {isLoadingRemove && <MyLoader />}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const CashFlow = () => {
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const filterOpen = useHydratedStore('filterOpen')
  const filters = useHydratedStore('filters')

  const setFilterOpen = useAppStore((state) => state.setFilterOpen)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 200,
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
    filters: {
      ...filters,
      date: {
        from: filters.date?.from.toString(),
        to: filters.date?.to.toString(),
      },
    },
    entityIds: entitiesSelected || [],
    pageIndex,
    pageSize,
  })

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
      cell: ({ row }) => {
        const cashFlow = row.original

        return (
          <>
            {cashFlow.type === TypePayment.TICKET && 'Boleto'}
            {cashFlow.type === TypePayment.TRANSFER && 'Transferência'}
          </>
        )
      },
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
            {cashFlow.typeFlow === TypeFlow.INCOME && 'Receita'}
            {cashFlow.typeFlow === TypeFlow.EXPENSE && 'Despesa'}
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
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => {
        const cashFlow = row.original
        const isPositive = cashFlow.typeFlow === TypeFlow.INCOME

        return (
          <div className='itens-center flex gap-1'>
            <div className={isPositive ? 'text-[green]' : 'text-destructive'}>
              {isPositive ? '+' : '-'}
            </div>
            <NumericFormat
              thousandSeparator='.'
              decimalSeparator=','
              prefix='R$ '
              placeholder='Valor'
              className={`bg-transparent ${
                isPositive ? 'text-[green]' : 'text-destructive'
              } `}
              disabled
              value={Number(cashFlow.amount)}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: () => <div className='text-right'>{'Status'}</div>,
      cell: ({ row }) => {
        const cashFlow = row.original

        return (
          <div className='flex items-center gap-1'>
            {cashFlow.status === StatusFlow.PAYED && 'Pago'}
            {cashFlow.status === StatusFlow.NOT_PAYDED && 'Não pago'}
            {isBefore(cashFlow.date, new Date()) &&
              cashFlow.status === StatusFlow.NOT_PAYDED && (
                <AlertTriangle color='hsl(var(--destructive))' />
              )}
          </div>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: () => <div className='text-right'>{'Editar/Deletar'}</div>,
      cell: ({ row }) => {
        const cashFlow = row.original

        return <ActionsCashFlow cashFlowId={cashFlow.id} />
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
        <div className='flex flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            <DialogCreateCashFlow />

            <Button
              variant='default'
              onClick={() => setFilterOpen(!filterOpen)}
              disabled={entitiesSelected.length === 0}
            >
              Filtrar
            </Button>
            {(entitiesSelected.length === 0 || entitiesSelected.length > 1) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className='cursor-pointer' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Para cadastrar precisa selecionar apenas uma entidade</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
              <div className={`flex w-full justify-center `}>
                <NumericFormat
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='R$ '
                  placeholder='Valor'
                  className={`bg-transparent text-center text-2xl font-bold ${
                    cashFlowResponse?.totalProfit &&
                    cashFlowResponse?.totalProfit >= 0
                      ? 'text-[green]'
                      : 'text-destructive'
                  } `}
                  disabled
                  value={cashFlowResponse?.totalProfit}
                />
              </div>
            </>
          )}
        </div>
      </>
    </Layout>
  )
}

export default CashFlow
