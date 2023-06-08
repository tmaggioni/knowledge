import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { type NumberFormatValues, NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { MyLoader } from '~/components/ui/myloader'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/utils/api'

const validationSchema = z.object({
  name: z.string().min(1, { message: 'nome é obrigatório' }),
  amount: z.number().min(1, 'Valor é campo obrigatório'),
  description: z.string().optional(),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface PropsFormEntity {
  onSuccess: () => void
  bankAccountId: string
}

const FormEditBankAccount = ({ onSuccess, bankAccountId }: PropsFormEntity) => {
  const { data: bankAccount, isLoading } = api.bankAccount.getById.useQuery({
    id: bankAccountId,
  })
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })

  const { mutate: edit, isLoading: isLoadingEdit } =
    api.bankAccount.edit.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    edit(
      {
        id: bankAccountId,
        name: values.name,
        amount: values.amount,
        description: values.description || '',
      },
      {
        onSuccess: (data) => {
          toast(`Conta corrente ${data.name} editada com sucesso`, {
            type: 'success',
          })
          void utils.bankAccount.getAll.invalidate()
          onSuccess()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          })
        },
      },
    )
  }

  useEffect(() => {
    if (bankAccount) {
      form.reset({
        name: bankAccount.name,
        description: bankAccount.description,
      })
    }
  }, [bankAccount, form])

  if (isLoading) {
    return <MyLoader />
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col space-y-2'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder='Nome' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='R$ '
                  placeholder='Valor'
                  className='flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onValueChange={(values: NumberFormatValues) => {
                    field.onChange(values.floatValue)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder='Descrição' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isLoadingEdit}>
          {isLoadingEdit && <MyLoader />}
          Editar
        </Button>
      </form>
    </Form>
  )
}

interface Props {
  bankAccountId: string
}

export function DialogEditBankAccount({ bankAccountId }: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <Button
        variant='ghost'
        className='h-8 w-8 p-0'
        onClick={() => setModalOpen(true)}
      >
        <Edit size={20} />
      </Button>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Editar conta corrente</DialogTitle>
        </DialogHeader>
        <FormEditBankAccount
          onSuccess={() => setModalOpen(false)}
          bankAccountId={bankAccountId}
        />
      </DialogContent>
    </Dialog>
  )
}
