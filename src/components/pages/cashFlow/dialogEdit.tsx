import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
  description: z.string().optional(),
  type: z.string(),
  status: z.boolean(),
  entityId: z.string(),
  categoryId: z.string(),
  date: z.date(),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface PropsFormEntity {
  onSuccess: () => void
  cashFlowId: string
}

const FormEditCashFlow = ({ onSuccess, cashFlowId }: PropsFormEntity) => {
  const { data: cashFlow, isLoading } = api.cashFlow.getById.useQuery({
    id: cashFlowId,
  })
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),

    values: {
      name: cashFlow?.name || '',
      description: cashFlow?.description,
      categoryId: cashFlow?.categoryId || '',
      date: cashFlow?.date || new Date(),
      entityId: cashFlow?.entityId || '',
      status: cashFlow?.status || false,
      type: cashFlow?.type || '',
    },
  })

  const { mutate: edit, isLoading: isLoadingEdit } =
    api.cashFlow.edit.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    edit(
      {
        id: cashFlowId,
        name: values.name,
        description: values.description || '',
        categoryId: values.categoryId,
        date: values.date,
        entityId: values.entityId,
        status: values.status,
        type: values.type,
      },
      {
        onSuccess: (data) => {
          toast(`Registro ${data.name} editado com sucesso`, {
            type: 'success',
          })
          void utils.cashFlow.getAll.invalidate()
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
  cashFlowId: string
}

export function DialogEditCashFlow({ cashFlowId }: Props) {
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
          <DialogTitle>Adicionar registro</DialogTitle>
        </DialogHeader>
        <FormEditCashFlow
          onSuccess={() => setModalOpen(false)}
          cashFlowId={cashFlowId}
        />
      </DialogContent>
    </Dialog>
  )
}
