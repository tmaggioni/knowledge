import { BarKnowledge } from '~/components/charts/barKnowledge'
import { PieKnowledge } from '~/components/charts/pieKnowledge'
import Layout from '~/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const DashBoard = () => {
  return (
    <Layout>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Visão geral</CardTitle>
          </CardHeader>
          <CardContent className='pl-2'>
            <BarKnowledge />
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Outra informação</CardTitle>
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
