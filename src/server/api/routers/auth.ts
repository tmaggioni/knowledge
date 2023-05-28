import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import cookie from 'cookie'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import { getJwtSecretKey } from '~/lib/auth'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { res } = ctx
      const { email, password } = input
      const user = await ctx.prisma.user.findUnique({ where: { email } })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dados incorretos',
        })
      }

      const hashPassword = bcrypt.hashSync(input.password, 10)
      if (bcrypt.compareSync(password, hashPassword)) {
        const token = await new SignJWT({})
          .setProtectedHeader({ alg: 'HS256' })
          .setJti(nanoid())
          .setIssuedAt()
          .setExpirationTime('10h')
          .sign(new TextEncoder().encode(getJwtSecretKey()))

        res.setHeader(
          'Set-Cookie',
          cookie.serialize('user-token', token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          }),
        )

        return
      }
    }),
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const hashPassword = bcrypt.hashSync(input.password, 10)
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashPassword,
          parent: '',
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
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader(
      'Set-Cookie',
      cookie.serialize('user-token', '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }),
    )
    return
  }),
})
