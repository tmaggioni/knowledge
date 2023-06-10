import type Decimal from 'decimal.js'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useHydratedStore } from '~/hooks/useAppStore'
import { api } from '~/utils/api'

import { MyLoader } from '../ui/myloader'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function BarKnowledge() {
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const { data, isFetching } = api.cashFlow.getTheBarData.useQuery(
    {
      entityIds: entitiesSelected,
    },
    {
      enabled: entitiesSelected.length > 0,
    },
  )

  if (isFetching)
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <MyLoader />
      </div>
    )

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data} defaultShowTooltip={false} desc=''>
        <XAxis
          dataKey='name'
          stroke='#888888'
          tickLine={false}
          axisLine={false}
        />
        <Tooltip formatter={(value) => BRL.format(Number(value))} />
        <Legend />
        <YAxis
          stroke='#888888'
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value as string}`}
        />
        <Bar dataKey='total' fill='#ccc' radius={[4, 4, 0, 0]} />

        <Bar dataKey={'receitas'} fill='#39b984' />
        <Bar dataKey={'despesas'} fill='#a11326' />
      </BarChart>
    </ResponsiveContainer>
  )
}
