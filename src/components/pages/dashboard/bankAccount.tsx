import { NumericFormat } from 'react-number-format'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { MyLoader } from '~/components/ui/myloader'
import { useHydratedStore } from '~/hooks/useAppStore'
import { api } from '~/utils/api'

export const BankAccount = () => {
  const entitiesSelected = useHydratedStore('entitiesSelected')
  const { data: bankAccounts, isFetching } =
    api.cashFlow.getCashFlowByAccount.useQuery(
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

  if (bankAccounts?.length === 0) {
    return null
  }
  return (
    <>
      {bankAccounts?.map((item) => (
        <Card key={item.bankAccount}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {item.bankAccount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <NumericFormat
                thousandSeparator='.'
                decimalSeparator=','
                prefix='R$ '
                className={`bg-transparent ${
                  item.value > 0 ? 'text-[green]' : 'text-destructive'
                } `}
                disabled
                value={Number(item.value)}
              />
            </div>
            {/* <p className='text-xs text-muted-foreground'>
              +20.1% from last month
            </p> */}
          </CardContent>
        </Card>
      ))}
    </>
  )
}
