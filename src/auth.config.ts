import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id
        token.rol = (user as { rol?: string }).rol
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { rol?: string }).rol = token.rol as string
      }
      return session
    },
  },
}
