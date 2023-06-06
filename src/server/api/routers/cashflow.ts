import { type StatusFlow, TypeFlow, type TypePayment } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { getMonthString } from '~/utils/helper'

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
          month: date.getMonth() + 1,
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
          month: date.getMonth() + 1,
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
            amountRange: z
              .object({
                minValue: z.number().optional(),
                maxValue: z.number().optional(),
              })
              .optional(),
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
      const { date, categoryId, name, status, type, typeFlow, amountRange } = {
        ...filters,
      }
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
            amount: {
              lte: amountRange?.maxValue,
              gte: amountRange?.minValue,
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
        ctx.prisma.cashFlow.count({
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
            amount: {
              lte: amountRange?.maxValue,
              gte: amountRange?.minValue,
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
        }),
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

  getTheBarData: privateProcedure
    .input(z.object({ entityIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const { entityIds } = input
      const parent = ctx.parent || ctx.userId

      const income = await ctx.prisma.cashFlow.groupBy({
        by: ['month'],
        _sum: {
          amount: true,
        },
        where: {
          entityId: {
            in: entityIds,
          },
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear(), 11, 1),
          },
          typeFlow: TypeFlow.INCOME,
          parentId: parent as string,
        },
      })

      const expense = await ctx.prisma.cashFlow.groupBy({
        by: ['month'],
        _sum: {
          amount: true,
        },
        where: {
          entityId: {
            in: entityIds,
          },
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear(), 11, 1),
          },
          typeFlow: TypeFlow.EXPENSE,
          parentId: parent as string,
        },
      })

      const result = []
      for (let month = 0; month < 12; month++) {
        result.push({
          name: getMonthString(month + 1),
          receitas:
            income.find((item) => item.month === month + 1)?._sum.amount ?? 0,
          despesas:
            expense.find((item) => item.month === month + 1)?._sum.amount ?? 0,
        })
      }

      return result
    }),
  getTheIncomePieData: privateProcedure
    .input(z.object({ entityIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const { entityIds } = input
      const parent = ctx.parent || ctx.userId

      const income = await ctx.prisma.cashFlow.groupBy({
        by: ['categoryId'],
        _sum: {
          amount: true,
        },
        where: {
          entityId: {
            in: entityIds,
          },
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear(), 11, 1),
          },
          typeFlow: TypeFlow.INCOME,
          parentId: parent as string,
        },
      })

      const result = []

      const allCategoriesByParent = await ctx.prisma.category.findMany({
        where: { parentId: parent as string },
      })

      for (const record of income) {
        const categoryName = allCategoriesByParent.find(
          (item) => item.id === record.categoryId,
        )?.name
        if (categoryName) {
          result.push({
            name: categoryName,
            value: Number(record._sum.amount),
          })
        }
      }

      return result
    }),
  getTheExpensePieData: privateProcedure
    .input(z.object({ entityIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const { entityIds } = input
      const parent = ctx.parent || ctx.userId

      const expense = await ctx.prisma.cashFlow.groupBy({
        by: ['categoryId'],
        _sum: {
          amount: true,
        },
        where: {
          entityId: {
            in: entityIds,
          },
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear(), 11, 1),
          },
          typeFlow: TypeFlow.EXPENSE,
          parentId: parent as string,
        },
      })

      const result = []

      for (const record of expense) {
        const category = await ctx.prisma.category.findUnique({
          where: { id: record.categoryId },
        })
        if (category) {
          result.push({
            name: category.name,
            value: Number(record._sum.amount),
          })
        }
      }

      return result
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
