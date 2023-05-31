import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const userRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userExist = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (userExist) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'E-mail já existe',
        })
      }

      const parent = ctx.parent || ctx.userId
      const salt = bcrypt.genSaltSync(10)
      const hashPassword = bcrypt.hashSync(input.password, salt)
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashPassword,
          parent: parent as string,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Problema ao cadastrar-se',
        })
      }
      return user
    }),
  getAll: privateProcedure.query(async ({ ctx }) => {
    const parent = ctx.parent || ctx.userId

    const users = await ctx.prisma.user.findMany({
      where: { parent: parent as string },
    })

    return users
  }),
  remove: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const deleted = await ctx.prisma.user.delete({
        where: {
          id: id,
        },
      })

      if (!deleted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Problema ao excluir o usuário',
        })
      }

      return deleted
    }),
  permissions: privateProcedure
    .input(
      z.object({
        entities: z.array(z.object({ entityId: z.string() })),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { entities, userId } = input

      const entitiesData = entities.map((item) => ({
        entity: {
          connect: { id: item.entityId },
        },
      }))

      const user = await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          entitiesUsers: {
            deleteMany: {},
            create: entitiesData.length > 0 ? entitiesData : [],
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Problema ao alterar permissão o usuário',
        })
      }

      return user
    }),
  getUserWithPermissions: privateProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const userWithPermissions = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: { entitiesUsers: { select: { entity: true } } },
      })

      if (!userWithPermissions) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Problema ao receber dados',
        })
      }

      return { ...userWithPermissions, password: 'Hahaha malandro' }
    }),
})
