import { useMemo, useState } from 'react'

import { BankAccount } from '@prisma/client'
import { type ColumnDef, type PaginationState } from '@tanstack/react-table'
import { Loader } from 'lucide-react'
import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'

import Layout from '~/components/layout/layout'
import DialogCreateBankAccount from '~/components/pages/bankAccount/dialogCreate'
import { DialogEditBankAccount } from '~/components/pages/bankAccount/dialogEdit'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { MyDeleteIcon } from '~/components/ui/mydeleteIcon'
import { api } from '~/utils/api'

const BankAccount = () => {
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
    data: bankAccountsResponse,
    isLoading,
    isFetching,
  } = api.bankAccount.getAll.useQuery({ pageIndex, pageSize })
  const { mutate: removeBankAccount, isLoading: isLoadingRemove } =
    api.bankAccount.remove.useMutation()

  const utils = api.useContext()

  const handleRemoveBankAccount = (id: string) => {
    removeBankAccount(
      { id },
      {
        onSuccess: (data) => {
          toast(`Entidade ${data.name} removida com sucesso`, {
            type: 'success',
          })
          void utils.bankAccount.getAll.invalidate()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => {
        const bankAccount = row.original

        return (
          <NumericFormat
            thousandSeparator='.'
            decimalSeparator=','
            value={bankAccount.amount.toString()}
            prefix='R$ '
            placeholder='Valor'
            disabled
            className='disabled:opacity-1 bg-transparent'
          />
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
    },
    {
      accessorKey: 'actions',
      header: () => <div className='text-right'>{'Editar/Deletar'}</div>,
      cell: ({ row }) => {
        const bankAccount = row.original

        return (
          <div className='text-right'>
            <DialogEditBankAccount bankAccountId={bankAccount.id} />
            <Button
              disabled={isLoadingRemove}
              variant='ghost'
              className='h-8 w-8 p-0'
              onClick={() => handleRemoveBankAccount(bankAccount.id)}
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
            { label: 'Conta corrente' },
          ]}
        />
        <div className='flex flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            <DialogCreateBankAccount />
            {(isLoading || isFetching) && (
              <Loader className='mr-2 h-4 w-4 animate-spin' />
            )}
          </div>

          {!isLoading && (
            <>
              <DataTable
                columns={columns}
                data={
                  bankAccountsResponse?.bankAccounts
                    ? bankAccountsResponse.bankAccounts
                    : []
                }
                pagination={pagination}
                hasPagination={true}
                setPagination={setPagination}
                total={bankAccountsResponse?.total}
              />
            </>
          )}
        </div>
      </>
    </Layout>
  )
}

export default BankAccount
