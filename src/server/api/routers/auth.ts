import { TRPCError } from "@trpc/server";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getJwtSecretKey } from "~/lib/auth";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import cookie from 'cookie';

export const authRouter = createTRPCRouter({
    login: publicProcedure
        .input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ input, ctx }) => {
            const { res } = ctx;
            const { email, password } = input;
            if (email === "123" && password === "123") {
                const token = await new SignJWT({})
                    .setProtectedHeader({ alg: 'HS256' })
                    .setJti(nanoid())
                    .setIssuedAt()
                    .setExpirationTime('10h')
                    .sign(new TextEncoder()
                        .encode(getJwtSecretKey()))

                res.setHeader('Set-Cookie', cookie.serialize('user-token', token, {
                    httpOnly: true,
                    path: '/',
                    secure: process.env.NODE_ENV === 'production'
                }))

                return;
            }
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: "Invalid credentials"
            })
        })
});
