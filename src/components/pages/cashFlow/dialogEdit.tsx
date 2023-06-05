import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { StatusFlow, TypeFlow, TypePayment } from '@prisma/client'
import { format } from 'date-fns'
import Decimal from 'decimal.js'
import { CalendarIcon, Check, ChevronsUpDown, Edit } from 'lucide-react'
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

const validationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  typeFlow: z.string(),
  status: z.string().optional(),
  categoryId: z.string(),
  amount: z.number().min(1, 'Valor é campo obrigatório'),
  date: z.date(),
})

type ValidationSchema = z.infer<typeof validationSchema>

interface PropsFormEntity {
  onSuccess: () => void
  cashFlowId: string
}

type NumberFormatValues = {
  floatValue: number | undefined
  formattedValue: string
  value: string
}

const FormEditCashFlow = ({ onSuccess, cashFlowId }: PropsFormEntity) => {
  const [open, setOpen] = useState(false)
  const entitiesSelected = useHydratedStore('entitiesSelected')
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

  const { data: cashFlow, isLoading } = api.cashFlow.getById.useQuery(
    {
      id: cashFlowId,
    },
    {
      enabled: Boolean(cashFlowId),
    },
  )

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })

  const { mutate: edit, isLoading: isLoadingEdit } =
    api.cashFlow.edit.useMutation()
  const utils = api.useContext()

  function onSubmit(values: ValidationSchema) {
    edit(
      {
        id: cashFlowId,
        name: values.name,
        description: values.description || '',
        categoryId: values.categoryId,
        date: values.date,
        entityId: entitiesSelected[0]!,
        status: values.status || '',
        type: values.type,
        typeFlow: values.typeFlow,
        amount: values.amount,
      },
      {
        onSuccess: (data) => {
          toast(`Registro ${data.name} editado com sucesso`, {
            type: 'success',
          })
          void utils.cashFlow.getAll.invalidate()
          void utils.cashFlow.getById.invalidate()
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

  useEffect(() => {
    if (cashFlow) {
      const amountFormated = new Decimal(cashFlow?.amount || 0)
      form.reset({
        name: cashFlow.name,
        description: cashFlow.description,
        categoryId: cashFlow.categoryId,
        date: cashFlow.date,
        status: cashFlow.status,
        type: TypePayment.TICKET,
        typeFlow: cashFlow.typeFlow,
        amount: amountFormated.toNumber(),
      })
    }
  }, [cashFlow, form])

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
          name='typeFlow'
          render={({ field }) => (
            <FormItem className='m-3'>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className='flex space-y-1'
                >
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value={TypeFlow.INCOME} />
                    </FormControl>
                    <FormLabel className='font-normal'>Receita</FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value={TypeFlow.EXPENSE} />
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione a forma' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={TypePayment.TICKET}>Boleto</SelectItem>
                  <SelectItem value={TypePayment.TRANSFER}>
                    Transferência
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
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
                  value={field.value}
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
              <FormLabel>Data</FormLabel>
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
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>Seleciona a data</span>
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
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

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
                <FormLabel className='text-base'>
                  {field.value === StatusFlow.PAYED ? 'Pago' : 'Não Pago'}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === StatusFlow.PAYED}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange(StatusFlow.PAYED)
                    } else {
                      field.onChange(StatusFlow.NOT_PAYDED)
                    }
                  }}
                />
              </FormControl>
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
  cashFlowId: string
}

export function DialogEditCashFlow({ cashFlowId }: Props) {
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
          <DialogTitle>Alterar registro</DialogTitle>
        </DialogHeader>
        <FormEditCashFlow
          onSuccess={() => setModalOpen(false)}
          cashFlowId={cashFlowId}
        />
      </DialogContent>
    </Dialog>
  )
}
