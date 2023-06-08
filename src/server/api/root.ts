import { createTRPCRouter } from '~/server/api/trpc'

import { authRouter } from './routers/auth'
import { bankAccountRouter } from './routers/bankAccount'
import { cashFlowRouter } from './routers/cashflow'
import { categoryRouter } from './routers/category'
import { entityRouter } from './routers/entity'
import { userRouter } from './routers/users'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  entity: entityRouter,
  category: categoryRouter,
  cashFlow: cashFlowRouter,
  bankAccount: bankAccountRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
