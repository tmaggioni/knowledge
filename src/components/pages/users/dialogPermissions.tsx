import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileLock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
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
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { MyLoader } from '~/components/ui/myloader'
import { api } from '~/utils/api'

const validationSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string().min(1, { message: 'nome é obrigatório' }),
      selected: z.boolean(),
    }),
  ),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface PropsFormEntity {
  onSuccess: () => void
  userId: string
}

const FormPermissions = ({ onSuccess, userId }: PropsFormEntity) => {
  const { data: entities, isLoading } = api.entity.getAll.useQuery()
  const { data: userWithPermissions, isLoading: isLoadingPermissions } =
    api.user.getUserWithPermissions.useQuery({ userId })

  const permissions = userWithPermissions?.entitiesUsers.map(
    (item) => item.entity.id,
  )

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),

    values: {
      entities:
        entities && entities.length > 0
          ? entities?.map((item) => ({
              id: item.id,
              selected: Boolean(permissions?.includes(item.id)),
            }))
          : [],
    },
  })

  const { mutate: managePermission, isLoading: isLoadingEdit } =
    api.user.permissions.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    managePermission(
      {
        userId,
        entities: values.entities
          .filter((item) => item.selected)
          .map((item) => {
            return { entityId: item.id }
          }),
      },
      {
        onSuccess: () => {
          toast('Permissões salvas', { type: 'success' })

          void utils.user.getUserWithPermissions.invalidate()
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

  if (isLoading || isLoadingPermissions) {
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
          name='entities'
          render={() => (
            <FormItem>
              {entities?.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name='entities'
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className='flex flex-row items-start space-x-3 space-y-0'
                      >
                        <FormControl>
                          <Checkbox
                            checked={
                              field.value.find((field) => field.id === item.id)
                                ?.selected
                            }
                            onCheckedChange={(checked) => {
                              return field.onChange(
                                field.value.map((value) => {
                                  return {
                                    id: value.id,
                                    selected:
                                      value.id === item.id
                                        ? checked
                                        : value.selected,
                                  }
                                }),
                              )
                            }}
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          {item.name}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
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
  userId: string
}

export function DialogPermissions({ userId }: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <Button
        variant='ghost'
        className='h-8 w-8 p-0'
        onClick={() => setModalOpen(true)}
      >
        <FileLock />
      </Button>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Configurar permissões</DialogTitle>
        </DialogHeader>
        <FormPermissions
          onSuccess={() => {
            console.log('eitaa ta chamando eu')
            setModalOpen(false)
          }}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  )
}
