import {
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { useHydratedStore } from '~/hooks/useAppStore'
import { api } from '~/utils/api'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function PieKnowledge() {
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const { data: expenses, isLoading } =
    api.cashFlow.getTheExpensePieData.useQuery(
      {
        entityIds: entitiesSelected,
      },
      {
        enabled: entitiesSelected.length > 0,
      },
    )

  const { data: incomes, isLoading: isLoadingIncomings } =
    api.cashFlow.getTheIncomePieData.useQuery(
      {
        entityIds: entitiesSelected,
      },
      {
        enabled: entitiesSelected.length > 0,
      },
    )

  console.log({
    expenses,
  })
  return (
    <ResponsiveContainer width='100%' height={350}>
      <PieChart height={250} defaultShowTooltip>
        <Tooltip formatter={(value) => BRL.format(Number(value))} />
        <LabelList />
        <Pie
          legendType='diamond'
          data={expenses}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          outerRadius={50}
          fill='#8884d8'
        />
        <Pie
          data={incomes}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={80}
          fill='#82ca9d'
          label
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
