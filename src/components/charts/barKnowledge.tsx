import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { useHydratedStore } from '~/hooks/useAppStore'
import { api } from '~/utils/api'

import { MyLoader } from '../ui/myloader'

export function BarKnowledge() {
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const { data, isLoading } = api.cashFlow.getTheBarData.useQuery({
    entityIds: entitiesSelected,
  })

  const newData = data?.map((item) => ({
    name: item.month,
    ['income']: item.income,
    ['expense']: item.expense,
  }))

  if (isLoading) return <MyLoader />

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={newData} defaultShowTooltip={false}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value as string}`}
        />
        <Bar dataKey='total' fill='#ccc' radius={[4, 4, 0, 0]} />

        <Bar dataKey={'income'} fill='#39b984' />
        <Bar dataKey={'expense'} fill='#a11326' />
      </BarChart>
    </ResponsiveContainer>
  )
}
