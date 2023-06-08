import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const bankAccountRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, description, amount } = input

      const userId = ctx.parent || ctx.userId
      const banks = await ctx.prisma.bankAccount.create({
        data: {
          name,
          description,
          amount,
          parentId: userId as string,
        },
      })

      if (!banks) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao cadastrar-se',
        })
      }
      return banks
    }),
  edit: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, amount } = input

      const bankAccount = await ctx.prisma.bankAccount.update({
        where: {
          id,
        },
        data: {
          name,
          amount,
          description,
        },
      })

      if (!bankAccount) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao editar',
        })
      }
      return bankAccount
    }),
  getAll: privateProcedure
    .input(z.object({ pageIndex: z.number(), pageSize: z.number() }))
    .query(async ({ input, ctx }) => {
      const parent = ctx.parent || ctx.userId
      const [bankAccounts, total] = await ctx.prisma.$transaction([
        ctx.prisma.bankAccount.findMany({
          where: { parentId: parent as string },
          skip: input.pageIndex,
          take: input.pageSize,
        }),
        ctx.prisma.bankAccount.count({ where: { parentId: parent as string } }),
      ])

      return {
        bankAccounts,
        total,
      }
    }),
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      const bankAccount = await ctx.prisma.bankAccount.findFirst({
        where: { id },
      })

      return bankAccount
    }),
  remove: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const deleted = await ctx.prisma.bankAccount.delete({
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
