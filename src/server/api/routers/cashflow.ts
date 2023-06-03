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
        status: z.boolean(),
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

      const cashFlow = await ctx.prisma.cashFlow.create({
        data: {
          name,
          description,
          type,
          status,
          categoryId,
          entityId,
          date,
          amount,
          typeFlow,
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
        status: z.boolean(),
        entityId: z.string(),
        categoryId: z.string(),
        date: z.date(),
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
      } = input

      const cashFlow = await ctx.prisma.cashFlow.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          type,
          status,
          categoryId,
          entityId,
          date,
          typeFlow,
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
        entityId: z.string(),
        pageIndex: z.number(),
        pageSize: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { entityId } = input
      const [cashFlow, total] = await ctx.prisma.$transaction([
        ctx.prisma.cashFlow.findMany({
          where: { entityId },
          skip: input.pageIndex,
          take: input.pageSize,
        }),
        ctx.prisma.cashFlow.count(),
      ])

      return {
        cashFlow,
        total,
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
