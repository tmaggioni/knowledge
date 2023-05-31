import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Loader2 } from 'lucide-react'
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

interface PropsFormEntity {
  onSuccess: () => void
  entityId: string
}

const FormEditEntity = ({ onSuccess, entityId }: PropsFormEntity) => {
  const { toast } = useToast()
  const { data: entity, isLoading } = api.entity.getById.useQuery({
    id: entityId,
  })
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),

    values: {
      name: entity?.name || '',
      description: entity?.description,
    },
  })

  const { mutate: edit, isLoading: isLoadingEdit } =
    api.entity.edit.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    edit(
      {
        id: entityId,
        name: values.name,
        description: values.description || '',
      },
      {
        onSuccess: (data) => {
          toast({
            title: 'Sucesso',
            description: `Entidade ${data.name} editada com sucesso`,
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

  if (isLoading) {
    return <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
          {isLoadingEdit && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Editar
        </Button>
      </form>
    </Form>
  )
}

interface Props {
  entityId: string
}

export function DialogEditEntity({ entityId }: Props) {
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
        <FormEditEntity
          onSuccess={() => setModalOpen(false)}
          entityId={entityId}
        />
      </DialogContent>
    </Dialog>
  )
}
