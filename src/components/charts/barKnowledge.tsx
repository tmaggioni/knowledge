import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  {
    name: 'Jan',
    total: 100,
  },
  {
    name: 'Feb',
    total: 100,
  },
  {
    name: 'Mar',
    total: 100,
  },
  {
    name: 'Apr',
    total: 100,
  },
  {
    name: 'May',
    total: 100,
  },
  {
    name: 'Jun',
    total: 100,
  },
  {
    name: 'Jul',
    total: 100,
  },
  {
    name: 'Aug',
    total: 100,
  },
  {
    name: 'Sep',
    total: 100,
  },
  {
    name: 'Oct',
    total: 100,
  },
  {
    name: 'Nov',
    total: 100,
  },
  {
    name: 'Dec',
    total: 100,
  },
]

export function BarKnowledge() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
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
        <Bar
          dataKey='total'
          fill='#ccc'
          radius={[4, 4, 0, 0]}
          // onClick={() => alert('asdasdd')}
          // onMouseOver={(a) => alert('entrou')}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
