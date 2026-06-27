import 'next-auth'

declare module 'next-auth' {
  interface User {
    rol?: string
  }
  interface Session {
    user: {
      id: string
      rol?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    rol?: string
  }
}
