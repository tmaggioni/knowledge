import { useEffect, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { StatusFlow, TypeFlow, TypePayment } from '@prisma/client'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'

const validationSchema = z.object({
  name: z.string().optional(),
  type: z.array(z.string()).optional(),
  typeFlow: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  categoryId: z.array(z.string()).optional(),
  amount: z.number().optional(),
  date: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
})

export type ValidationFilterSchema = z.infer<typeof validationSchema>

export const FiltersCashFlow = () => {
  const filterOpen = useHydratedStore('filterOpen')
  const filters = useHydratedStore('filters')
  const setFilterOpen = useAppStore((state) => state.setFilterOpen)
  const setFilters = useAppStore((state) => state.setFilters)

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
      name: filters.name,
      categoryId: filters.categoryId,
      status: filters.status,
      type: filters.type,
      typeFlow: filters.typeFlow,
      date: {
        from: filters.date?.from || new Date(),
        to: filters.date?.to || new Date(),
      },
    },
  })

  function onSubmit(values: ValidationFilterSchema) {
    setFilters(values)
  }

  return (
    <Sheet open={filterOpen} onOpenChange={setFilterOpen} modal={false}>
      <SheetContent position='right' size='sm'>
        <SheetHeader>
          <SheetTitle>Filtrar</SheetTitle>
        </SheetHeader>
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
                              <Checkbox
                                checked={field.value?.includes(TypeFlow.INCOME)}
                                onCheckedChange={(checked) => {
                                  return checked
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
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Receita
                            </FormLabel>
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
                              <Checkbox
                                checked={field.value?.includes(
                                  TypeFlow.EXPENSE,
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
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
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Despesa
                            </FormLabel>
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
                                <Checkbox
                                  checked={field.value?.includes(item.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
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
                                />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {item.label}
                              </FormLabel>
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
                    <FormLabel className='text-base'>
                      Tipo de Pagamento
                    </FormLabel>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <FormField
                      control={form.control}
                      name='type'
                      render={({ field }) => {
                        return (
                          <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(
                                  TypePayment.TICKET,
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange(
                                        field.value
                                          ? [...field.value, TypePayment.TICKET]
                                          : [TypePayment.TICKET],
                                      )
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) =>
                                            value !== TypePayment.TICKET,
                                        ),
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Boleto
                            </FormLabel>
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
                              <Checkbox
                                checked={field.value?.includes(
                                  TypePayment.TRANSFER,
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange(
                                        field.value
                                          ? [
                                              ...field.value,
                                              TypePayment.TRANSFER,
                                            ]
                                          : [TypePayment.TICKET],
                                      )
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) =>
                                            value !== TypePayment.TRANSFER,
                                        ),
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Transferência
                            </FormLabel>
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
                              <Checkbox
                                checked={field.value?.includes(
                                  StatusFlow.PAYED,
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
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
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>Pago</FormLabel>
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
                              <Checkbox
                                checked={field.value?.includes(
                                  StatusFlow.NOT_PAYDED,
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
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
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Não pago
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-2 flex items-center gap-2'>
              <Button type='submit'>Filtrar</Button>
              <Button
                onClick={() => {
                  form.reset()
                  setFilters({})
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
