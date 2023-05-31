import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '~/components/ui/textarea'
import { useToast } from '~/components/ui/use-toast'
import { api } from '~/utils/api'

const validationSchema = z.object({
  name: z.string().min(1, { message: 'nome é obrigatório' }),
  description: z.string().optional(),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface Props {
  onSuccess: () => void
}

const FormCreateEntity = ({ onSuccess }: Props) => {
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })

  const { toast } = useToast()

  const { mutate: create, isLoading } = api.entity.create.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    create(
      { name: values.name, description: values.description || '' },
      {
        onSuccess: (data) => {
          toast({
            title: 'Sucesso',
            description: `Entidade ${data.name} adicionada com sucesso`,
          })
          void utils.entity.getAll.invalidate()
          onSuccess()
        },
        onError: (err) => {
          toast({
            title: 'Erro',
            description: err.message,
            variant: 'destructive',
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
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Salvar
        </Button>
      </form>
    </Form>
  )
}

export function DialogCreateEntity() {
  const [modalOpen, setModalOpen] = useState<boolean | undefined>(false)

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <Button variant='default' onClick={() => setModalOpen(true)}>
        Nova entidade
      </Button>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Adicionar entidade</DialogTitle>
        </DialogHeader>
        <FormCreateEntity onSuccess={() => setModalOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
