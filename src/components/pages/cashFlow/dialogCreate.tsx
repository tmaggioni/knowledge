import { useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/ui/command'
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
import { Input } from '~/components/ui/input'
import { MyLoader } from '~/components/ui/myloader'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { useHydratedStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

type NumberFormatValues = {
  floatValue: number | undefined
  formattedValue: string
  value: string
}

const validationSchema = z.object({
  name: z.string().min(1, { message: 'Obrigatório' }),
  description: z.string().optional(),
  type: z.string().min(1, { message: 'Obrigatório' }),
  typeFlow: z.string().min(1, { message: 'Obrigatório' }),
  status: z.boolean().default(false).optional(),
  categoryId: z.string().min(1, { message: 'Obrigatório' }),
  amount: z.number().min(1, { message: 'Obrigatório' }),
  date: z.date(),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface Props {
  onSuccess: () => void
}

const FormCreateCashFlow = ({ onSuccess }: Props) => {
  const [open, setOpen] = useState(false)

  const entitiesSelected = useHydratedStore('entitiesSelected')
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })

  const { mutate: create, isLoading } = api.cashFlow.create.useMutation()

  const { data: categories } = api.category.getAll.useQuery({
    pageIndex: 0,
    pageSize: 2000,
  })

  const optionsCategory = useMemo(() => {
    return categories?.categories?.map((item) => ({
      label: item.name,
      value: item.id,
    }))
  }, [categories])

  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    create(
      {
        name: values.name,
        description: values.description || '',
        categoryId: values.categoryId,
        date: values.date,
        entityId: entitiesSelected[0]!,
        status: values.status || false,
        type: values.type,
        amount: values.amount,
        typeFlow: values.typeFlow,
      },
      {
        onSuccess: (data) => {
          toast(`Registro ${data.name} adicionado com sucesso`)
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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col space-y-2'
      >
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem className='m-3'>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex space-y-1'
                >
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='all' />
                    </FormControl>
                    <FormLabel className='font-normal'>Receita</FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='mentions' />
                    </FormControl>
                    <FormLabel className='font-normal'>Despesa</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? optionsCategory?.find(
                            (category) => category.value === field.value,
                          )?.label
                        : 'Categoria'}

                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command
                    filter={(value, search) => {
                      return optionsCategory &&
                        optionsCategory
                          .find((item) => item.value === value)
                          ?.label.includes(search)
                        ? 1
                        : 0
                    }}
                  >
                    <CommandInput placeholder='Selecione uma categoria...' />
                    <CommandEmpty>Categoria não encontrada.</CommandEmpty>
                    <CommandGroup>
                      {optionsCategory?.map((category) => (
                        <CommandItem
                          value={category.value}
                          key={category.value}
                          onSelect={(value) => {
                            form.setValue('categoryId', value)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              category.label === field.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {category.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione a forma' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='Boleto'>Boleto</SelectItem>
                  <SelectItem value='Transferência'>Transferência</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Status</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='R$ '
                  placeholder='Valor'
                  className='flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onValueChange={(values: NumberFormatValues) => {
                    field.onChange(values.floatValue)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

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

export default function DialogCreateCashFlow() {
  const [modalOpen, setModalOpen] = useState<boolean | undefined>(false)
  const entitiesSelected = useHydratedStore('entitiesSelected')

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <Button
        variant='default'
        onClick={() => setModalOpen(true)}
        disabled={entitiesSelected.length === 0 || entitiesSelected.length > 1}
      >
        Novo cadastro
      </Button>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Adicionar</DialogTitle>
        </DialogHeader>
        <FormCreateCashFlow onSuccess={() => setModalOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
