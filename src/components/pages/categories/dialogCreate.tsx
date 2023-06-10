import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
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

interface Props {
  onSuccess: () => void
}

const FormCreateCategory = ({ onSuccess }: Props) => {
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })

  const { mutate: create, isLoading } = api.category.create.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    create(
      { name: values.name, description: values.description || '' },
      {
        onSuccess: (data) => {
          toast(`Categoria ${data.name} adicionada com sucesso`)
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

        <Button type='submit' disabled={isLoading}>
          {isLoading && <MyLoader />}
          Salvar
        </Button>
      </form>
    </Form>
  )
}

interface PropsDialogCategory {
  isLink?: boolean
}

export default function DialogCreateCategory({ isLink }: PropsDialogCategory) {
  const [modalOpen, setModalOpen] = useState<boolean | undefined>(false)

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {!isLink && (
        <Button variant='default' onClick={() => setModalOpen(true)}>
          Nova categoria
        </Button>
      )}

      {isLink && (
        <Button
          variant='link'
          className='text-xs underline'
          onClick={() => setModalOpen(true)}
        >
          Adicionar
        </Button>
      )}

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Adicionar categoria</DialogTitle>
        </DialogHeader>
        <FormCreateCategory onSuccess={() => setModalOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
