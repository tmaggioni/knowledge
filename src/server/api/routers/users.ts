import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const userRouter = createTRPCRouter({
  createUser: privateProcedure
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

      const userId = ctx.userId
      const salt = bcrypt.genSaltSync(10)
      const hashPassword = bcrypt.hashSync(input.password, salt)
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashPassword,
          parent: userId as string,
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
  getUsers: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId
    const users = await ctx.prisma.user.findMany({
      where: { parent: userId as string },
    })

    return users
  }),
})