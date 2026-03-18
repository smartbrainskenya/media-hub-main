import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        console.log('[AUTH] Attempting login for:', credentials.email);

        if (!db) {
          console.error('[AUTH] DB client not initialized');
          return null;
        }

        const { data: user, error } = await db
          .from('admin_users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error || !user) {
          console.error('[AUTH] User not found or DB error:', error?.message);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) {
          console.error('[AUTH] Invalid password for:', credentials.email);
          return null;
        }

        console.log('[AUTH] Successful login for:', credentials.email);
        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
  },
});
