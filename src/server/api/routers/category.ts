import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const categoryRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ name: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name, description } = input

      const userId = ctx.parent || ctx.userId
      const categories = await ctx.prisma.category.create({
        data: {
          name,
          description,
          parentId: userId as string,
        },
      })

      if (!categories) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao cadastrar-se',
        })
      }
      return categories
    }),
  edit: privateProcedure
    .input(
      z.object({ id: z.string(), name: z.string(), description: z.string() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, description } = input

      const categories = await ctx.prisma.category.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      })

      if (!categories) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao editar',
        })
      }
      return categories
    }),
  getAll: privateProcedure
    .input(z.object({ pageIndex: z.number(), pageSize: z.number() }))
    .query(async ({ input, ctx }) => {
      const parent = ctx.parent || ctx.userId
      const [categories, total] = await ctx.prisma.$transaction([
        ctx.prisma.category.findMany({
          where: { parentId: parent as string },
          skip: input.pageIndex,
          take: input.pageSize,
        }),
        ctx.prisma.category.count(),
      ])

      return {
        categories,
        total,
      }
    }),
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      const category = await ctx.prisma.category.findFirst({
        where: { id },
      })

      return category
    }),
  remove: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const deleted = await ctx.prisma.category.delete({
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
