import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Layout from '~/components/layout/layout'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { api } from '~/utils/api'

const validationSchema = z.object({
  email: z.string().min(1, { message: 'e-mail é obrigatório' }).email({
    message: 'Precisa ser um e-mail válido',
  }),
  password: z
    .string()
    .min(3, { message: 'Senha deve possuir no minimo 3 carácteres' }),
})

type ValidationSchema = z.infer<typeof validationSchema>
const Users = () => {
  const router = useRouter()
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
    },
  })
  function onSubmit(values: ValidationSchema) {
    // login(
    //   { email: values.email, password: values.password },
    //   {
    //     onSuccess: (data) => {
    //       if (data) {
    //         setUser(data)
    //         void router.push('/dashboard')
    //       }
    //     },
    //     onError: (err) => {
    //       toast({
    //         title: 'Erro',
    //         description: err.message,
    //       })
    //     },
    //   },
    // )
  }
  return (
    <Layout>
      <>
        <Breadcrumb
          links={[
            { label: 'Dashboard', link: '/dashboard' },
            { label: 'Usuários' },
          ]}
        />
        <div className='grid  max-w-md gap-4'>
          <Card className='col-span-4 shadow-lg'>
            <CardHeader>Cadastro de usuários</CardHeader>
            <CardContent className='pl-2'>
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
                          <Input
                            placeholder='Senha'
                            type='password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type='submit'>
                    {/* {isLoading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )} */}
                    Salvar
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </>
    </Layout>
  )
}

export default Users
