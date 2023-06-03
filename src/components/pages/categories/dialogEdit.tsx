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
})

type ValidationSchema = z.infer<typeof validationSchema>

interface PropsFormEntity {
  onSuccess: () => void
  categoryId: string
}

const FormEditCategory = ({ onSuccess, categoryId }: PropsFormEntity) => {
  const { data: category, isLoading } = api.category.getById.useQuery({
    id: categoryId,
  })
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),

    values: {
      name: category?.name || '',
      description: category?.description,
    },
  })

  const { mutate: edit, isLoading: isLoadingEdit } =
    api.category.edit.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    edit(
      {
        id: categoryId,
        name: values.name,
        description: values.description || '',
      },
      {
        onSuccess: (data) => {
          toast(`Entidade ${data.name} editada com sucesso`, {
            type: 'success',
          })
          void utils.category.getAll.invalidate()
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
  categoryId: string
}

export function DialogEditCategory({ categoryId }: Props) {
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
          <DialogTitle>Adicionar entidade</DialogTitle>
        </DialogHeader>
        <FormEditCategory
          onSuccess={() => setModalOpen(false)}
          categoryId={categoryId}
        />
      </DialogContent>
    </Dialog>
  )
}
