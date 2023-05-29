import { BarKnowledge } from '~/components/charts/barKnowledge'
import { PieKnowledge } from '~/components/charts/pieKnowledge'
import Layout from '~/components/layout/layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

const DashBoard = () => {
  return (
    <Layout>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className='pl-2'>
            <BarKnowledge />
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <PieKnowledge />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default DashBoard
