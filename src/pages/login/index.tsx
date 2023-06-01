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
import { useAppStore } from '~/hooks/useAppStore'

import { api } from '../../utils/api'

const validationSchema = z.object({
  email: z.string().min(1, { message: 'e-mail é obrigatório' }).email({
    message: 'Precisa ser um e-mail válido',
  }),
  password: z
    .string()
    .min(3, { message: 'Senha deve possuir no minimo 3 carácteres' }),
})

type ValidationSchema = z.infer<typeof validationSchema>

const Login = () => {
  const { mutate: login, isLoading } = api.auth.login.useMutation()
  const setUser = useAppStore((state) => state.setUser)

  const router = useRouter()
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: ValidationSchema) {
    login(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          if (data) {
            setUser(data)
            void router.push('/dashboard')
          }
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
        <title>Login</title>
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

              <Button type='submit'>
                {isLoading && <MyLoader />}
                Entrar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}

export default Login
