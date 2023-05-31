import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const entityRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ name: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name, description } = input

      const userId = ctx.parent || ctx.userId
      const entity = await ctx.prisma.entity.create({
        data: {
          name,
          description,
          parentId: userId as string,
        },
      })

      if (!entity) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao cadastrar-se',
        })
      }
      return entity
    }),
  edit: privateProcedure
    .input(
      z.object({ id: z.string(), name: z.string(), description: z.string() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, description } = input

      const entity = await ctx.prisma.entity.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      })

      if (!entity) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao editar',
        })
      }
      return entity
    }),
  getAll: privateProcedure.query(async ({ ctx }) => {
    // if (ctx.parent) {
    //   throw new TRPCError({
    //     code: 'FORBIDDEN',
    //     message: 'Proibido',
    //   })
    // }
    const parent = ctx.parent || ctx.userId
    const entities = await ctx.prisma.entity.findMany({
      where: { parentId: parent as string },
    })

    return entities
  }),
  getAllByUser: privateProcedure.query(async ({ ctx }) => {
    const userWithEntities = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.userId as string,
      },
      include: {
        entitiesUsers: {
          select: {
            entity: true,
          },
        },
      },
    })

    return userWithEntities?.entitiesUsers
  }),
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      const user = await ctx.prisma.entity.findFirst({
        where: { id },
      })

      return user
    }),
  remove: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const deleted = await ctx.prisma.entity.delete({
        where: {
          id: id,
        },
      })

      if (!deleted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Problema ao excluir a entidade',
        })
      }

      return deleted
    }),
})
