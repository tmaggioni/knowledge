import { useRouter } from 'next/router'

import { BarKnowledge } from '~/components/charts/barKnowledge'
import { PieKnowledge } from '~/components/charts/pieKnowledge'
import Layout from '~/components/layout/layout'

const DashBoard = () => {
  return (
    <Layout>
      <div className='flex'>
        <PieKnowledge />
        <BarKnowledge />
      </div>
    </Layout>
  )
}

export default DashBoard
