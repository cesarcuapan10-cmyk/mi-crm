import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const usuario = await prisma.usuario.findFirst({
          where: { email: parsed.data.email, eliminadoEn: null },
        })

        if (!usuario) return null

        const valid = await bcrypt.compare(parsed.data.password, usuario.password)
        if (!valid) return null

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        }
      },
    }),
  ],
})
