import { type StatusFlow, TypeFlow, type TypePayment } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const cashFlowRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.string(),
        typeFlow: z.string(),
        status: z.string(),
        entityId: z.string(),
        categoryId: z.string(),
        amount: z.number(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        type,
        categoryId,
        entityId,
        status,
        date,
        amount,
        typeFlow,
      } = input

      const parent = ctx.parent || ctx.userId

      const cashFlow = await ctx.prisma.cashFlow.create({
        data: {
          name,
          description,
          type: type as TypePayment,
          status: status as StatusFlow,
          categoryId,
          entityId,
          date,
          amount,
          typeFlow: typeFlow as TypeFlow,
          parentId: parent as string,
        },
      })

      if (!cashFlow) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao cadastrar-se',
        })
      }
      return cashFlow
    }),
  edit: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.string(),
        typeFlow: z.string(),
        status: z.string(),
        entityId: z.string(),
        categoryId: z.string(),
        date: z.date(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        description,
        type,
        categoryId,
        entityId,
        status,
        date,
        typeFlow,
        amount,
      } = input

      const cashFlow = await ctx.prisma.cashFlow.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          type: type as TypePayment,
          status: status as StatusFlow,
          categoryId,
          entityId,
          date,
          amount,
          typeFlow: typeFlow as TypeFlow,
        },
      })

      if (!cashFlow) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao editar',
        })
      }
      return cashFlow
    }),
  getAll: privateProcedure
    .input(
      z.object({
        entityIds: z.array(z.string()),
        filters: z
          .object({
            name: z.string().optional(),
            type: z.array(z.string()).optional(),
            typeFlow: z.array(z.string()).optional(),
            status: z.array(z.string()).optional(),
            categoryId: z.array(z.string()).optional(),
            amount: z.number().optional(),
            date: z.object({
              from: z.string().optional(),
              to: z.string().optional(),
            }),
          })
          .optional(),
        pageIndex: z.number(),
        pageSize: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { entityIds, filters } = input
      const { date, categoryId, name, status, type, typeFlow } = { ...filters }
      const parent = ctx.parent || ctx.userId

      const [cashFlow, total] = await ctx.prisma.$transaction([
        ctx.prisma.cashFlow.findMany({
          where: {
            entityId: {
              in: entityIds,
            },
            name: {
              contains: name,
            },
            categoryId: {
              in: categoryId,
            },
            type: {
              in:
                type && type?.length > 0 ? (type as TypePayment[]) : undefined,
            },
            typeFlow: {
              in:
                typeFlow && typeFlow?.length > 0
                  ? (typeFlow as TypeFlow[])
                  : undefined,
            },
            status: {
              in:
                status && status?.length > 0
                  ? (status as StatusFlow[])
                  : undefined,
            },

            date: {
              lte: new Date(
                new Date(date?.to || new Date()).setHours(23, 59, 59, 999),
              ),
              gte: new Date(
                new Date(date?.from || new Date()).setHours(0, 0, 0, 0),
              ),
            },
            parentId: parent as string,
          },
          include: {
            category: { select: { name: true } },
          },
          skip: input.pageIndex,
          take: input.pageSize,
        }),
        ctx.prisma.cashFlow.count(),
      ])

      const totalProfit = cashFlow.reduce((profit, transaction) => {
        if (transaction.typeFlow === TypeFlow.INCOME) {
          return profit + Number(transaction.amount)
        } else if (transaction.typeFlow === TypeFlow.EXPENSE) {
          return profit - Number(transaction.amount)
        } else {
          return profit
        }
      }, 0)
      return {
        cashFlow,
        total,
        totalProfit,
      }
    }),
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      const cashFlow = await ctx.prisma.cashFlow.findFirst({
        where: { id },
      })

      return cashFlow
    }),
  remove: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const deleted = await ctx.prisma.cashFlow.delete({
        where: {
          id: id,
        },
      })

      if (!deleted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Problema ao excluir a categoria',
        })
      }

      return deleted
    }),
})
