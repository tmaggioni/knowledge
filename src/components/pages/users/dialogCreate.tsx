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
import { api } from '~/utils/api'

const validationSchema = z
  .object({
    email: z.string().min(1, { message: 'e-mail é obrigatório' }).email({
      message: 'Precisa ser um e-mail válido',
    }),
    password: z
      .string({
        required_error: 'campo obrigatório',
      })
      .min(3, { message: 'Senha deve possuir no minimo 3 carácteres' }),
    confirmPassword: z
      .string({
        required_error: 'campo obrigatório',
      })
      .min(1, { message: 'Senha deve possuir no minimo 3 carácteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Senha não confere',
  })

type ValidationSchema = z.infer<typeof validationSchema>

interface Props {
  onSuccess: () => void
}

const FormCreateUser = ({ onSuccess }: Props) => {
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
    },
  })

  const { mutate: create, isLoading } = api.user.create.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    create(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          toast(`Usuário ${data.email} adicionado com sucesso`, {
            type: 'success',
          })
          void utils.user.getAll.invalidate()
          onSuccess()
        },
        onError: (err) => {
          toast(err.message, {
            type: 'success',
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder='E-mail' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder='Senha' type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder='Confirme a senha'
                  type='password'
                  {...field}
                />
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

export function DialogCreateUser() {
  const [modalOpen, setModalOpen] = useState<boolean | undefined>(false)

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <Button variant='default' onClick={() => setModalOpen(true)}>
        Novo usuário
      </Button>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Adicionar usuário</DialogTitle>
        </DialogHeader>
        <FormCreateUser onSuccess={() => setModalOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
