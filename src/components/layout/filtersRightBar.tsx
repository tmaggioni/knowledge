import { useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { StatusFlow, TypeFlow, TypePayment } from '@prisma/client'
import { format } from 'date-fns'
import { CalendarIcon, CopyX } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { type NumberFormatValues, NumericFormat } from 'react-number-format'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { useAppStore, useHydratedStore } from '~/hooks/useAppStore'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Slider } from '../ui/slider'

const validationSchema = z.object({
  name: z.string().optional(),
  type: z.array(z.string()).optional(),
  typeFlow: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  categoryId: z.array(z.string()).optional(),
  date: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
})

export type ValidationFilterSchema = z.infer<typeof validationSchema>
const MAXVALUE = 200000

export const FiltersRightBar = () => {
  const filterOpen = useHydratedStore('filterOpen')
  const filters = useHydratedStore('filters')
  const setFilterOpen = useAppStore((state) => state.setFilterOpen)
  const setFilters = useAppStore((state) => state.setFilters)
  const [amountValues, setAmoutValues] = useState({
    minValue: 0,
    maxValue: MAXVALUE,
  })

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

  const form = useForm<ValidationFilterSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: filters?.name,
      categoryId: filters?.categoryId,
      status: filters?.status,
      type: filters?.type,
      typeFlow: filters?.typeFlow,
      date: {
        from: filters.date?.from || new Date(),
        to: filters.date?.to || new Date(),
      },
    },
  })

  function onSubmit(values: ValidationFilterSchema) {
    setFilters({
      ...values,
      amountRange: {
        minValue: amountValues.minValue,
        maxValue: amountValues.maxValue,
      },
    })
  }
  return (
    <div
      className={`absolute p-4 ${
        filterOpen ? 'right-0' : '-right-[100%]'
      } top-0 z-50 flex h-screen w-full max-w-[30%]  flex-col gap-2 bg-background shadow-md transition-all`}
    >
      <div className='flex w-full items-center justify-between text-2xl font-extrabold tracking-tight '>
        Filtros
        <CopyX
          className='cursor-pointer'
          onClick={() => setFilterOpen(false)}
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='mt-2 flex flex-col gap-2 scroll-auto'
        >
          <FormField
            control={form.control}
            name='typeFlow'
            render={() => (
              <FormItem>
                <div className='flex flex-wrap gap-2'>
                  <FormField
                    control={form.control}
                    name='typeFlow'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(TypeFlow.INCOME)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(TypeFlow.INCOME)
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, TypeFlow.INCOME]
                                        : [TypeFlow.INCOME],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== TypeFlow.INCOME,
                                      ),
                                    )
                              }}
                            >
                              Receita
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                  <FormField
                    control={form.control}
                    name='typeFlow'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(TypeFlow.EXPENSE)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(TypeFlow.EXPENSE)
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, TypeFlow.EXPENSE]
                                        : [TypeFlow.EXPENSE],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== TypeFlow.EXPENSE,
                                      ),
                                    )
                              }}
                            >
                              Despesa
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='categoryId'
            render={() => (
              <FormItem>
                <div className='mb-4'>
                  <FormLabel className='text-base'>Categorias</FormLabel>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {optionsCategory?.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name='categoryId'
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.value}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Button
                                variant={
                                  field.value?.includes(item.value)
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={(e) => {
                                  e.preventDefault()
                                  !field.value?.includes(item.value)
                                    ? field.onChange(
                                        field.value
                                          ? [...field.value, item.value]
                                          : [item.value],
                                      )
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value,
                                        ),
                                      )
                                }}
                              >
                                {item.label}
                              </Button>
                            </FormControl>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={() => (
              <FormItem>
                <div className='mb-4'>
                  <FormLabel className='text-base'>Tipo de Pagamento</FormLabel>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(TypePayment.TICKET)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(TypePayment.TICKET)
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, TypePayment.TICKET]
                                        : [TypePayment.TICKET],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== TypePayment.TICKET,
                                      ),
                                    )
                              }}
                            >
                              Boleto
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(TypePayment.TRANSFER)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(TypePayment.TRANSFER)
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, TypePayment.TRANSFER]
                                        : [TypePayment.TRANSFER],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) =>
                                          value !== TypePayment.TRANSFER,
                                      ),
                                    )
                              }}
                            >
                              Transferência
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                </div>
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
                        id='date'
                        variant={'outline'}
                        className={cn(
                          'w-[300px] justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {field.value?.from ? (
                          field?.value.to ? (
                            <>
                              {format(field.value?.from, 'LLL dd, y')} -{' '}
                              {format(field?.value.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(field.value?.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      selected={field.value}
                      mode='range'
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
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder='Nome' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='status'
            render={() => (
              <FormItem>
                <div className='mb-4'>
                  <FormLabel className='text-base'>Status</FormLabel>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(StatusFlow.PAYED)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(StatusFlow.PAYED)
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, StatusFlow.PAYED]
                                        : [StatusFlow.PAYED],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== StatusFlow.PAYED,
                                      ),
                                    )
                              }}
                            >
                              Pago
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => {
                      return (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Button
                              variant={
                                field.value?.includes(StatusFlow.NOT_PAYDED)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault()
                                !field.value?.includes(StatusFlow.NOT_PAYDED)
                                  ? field.onChange(
                                      field.value
                                        ? [
                                            ...field.value,
                                            StatusFlow.NOT_PAYDED,
                                          ]
                                        : [StatusFlow.NOT_PAYDED],
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) =>
                                          value !== StatusFlow.NOT_PAYDED,
                                      ),
                                    )
                              }}
                            >
                              Não pago
                            </Button>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex flex-col'>
            <FormLabel className=' mb-2 mt-1'>Valor</FormLabel>
            <Slider
              onValueChange={([minValue, maxValue]) =>
                setAmoutValues({
                  minValue: minValue || 0,
                  maxValue: maxValue || MAXVALUE,
                })
              }
              defaultValue={[0, MAXVALUE]}
              value={[amountValues.minValue, amountValues.maxValue]}
              max={MAXVALUE}
            />
            <div className='item-scenter mt-3 flex justify-between'>
              <div className='flex w-full items-center'>
                <NumericFormat
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='R$ '
                  value={amountValues.minValue}
                  className='flex h-10  rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onValueChange={(values: NumberFormatValues) => {
                    setAmoutValues((prev) => ({
                      ...prev,
                      minValue: values.floatValue || 0,
                    }))
                  }}
                />
              </div>
              <div className='flex items-center'>
                <NumericFormat
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='R$ '
                  value={amountValues.maxValue}
                  className='flex h-10  rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onValueChange={(values: NumberFormatValues) => {
                    setAmoutValues((prev) => ({
                      ...prev,
                      maxValue: values.floatValue || MAXVALUE,
                    }))
                  }}
                />
              </div>
            </div>
          </div>
          <div className='col-span-2 flex items-center justify-between gap-2'>
            <Button type='submit'>Filtrar</Button>
            <Button
              variant={'ghost'}
              onClick={() => {
                form.reset()
                setFilters({})
                setAmoutValues({
                  maxValue: MAXVALUE,
                  minValue: 0,
                })
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
