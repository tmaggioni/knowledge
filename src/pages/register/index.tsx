import Head from 'next/head'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { MyLoader } from '~/components/ui/myloader'

import { api } from '../../utils/api'

const validationSchema = z
  .object({
    email: z.string().min(1, { message: 'e-mail é obrigatório' }).email({
      message: 'Precisa ser um e-mail válido',
    }),
    password: z
      .string()
      .min(3, { message: 'Senha deve possuir no minimo 3 carácteres' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Senha deve possuir no minimo 3 carácteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Senha não confere',
  })

type ValidationSchema = z.infer<typeof validationSchema>

const Register = () => {
  const { mutate: create, isLoading } = api.auth.register.useMutation()
  const router = useRouter()
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(values: ValidationSchema) {
    create(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast('Cadastro realizado com sucesso', {
            type: 'success',
          })
          setTimeout(() => {
            void router.push('/dashboard')
          }, 1000)
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
    <>
      <Head>
        <title>Cadastro</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex h-screen w-full flex-col items-center justify-center  '>
        <div className='max-w-md'>
          <div className='mb-2 flex flex-col gap-1'>
            <h1 className='text-center text-4xl  font-extrabold '>Knowledge</h1>
            <p className='text-center '>Sisteminha pra gerenciar as contas</p>
          </div>
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
                        placeholder='Confirmar senha'
                        type='password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>
                {isLoading && <MyLoader />}
                Cadastrar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}

export default Register
