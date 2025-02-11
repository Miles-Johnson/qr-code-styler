import type { AuthOptions } from "next-auth";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/src/queries/select";
import { insertUser } from "@/src/queries/insert";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const runtime = 'nodejs';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-do-not-use-in-production',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists
          let dbUser = await getUserByEmail(user.email);
          
          // If user doesn't exist, create them
          if (!dbUser) {
            console.log('Creating new user for:', user.email);
            const [newUser] = await insertUser({
              email: user.email,
              name: user.name || null,
              role: 'user',
              emailVerified: true,
              hashedPassword: await bcrypt.hash(Math.random().toString(36), 10),
              lastLogin: new Date(),
              createdAt: new Date(),
            });
            dbUser = newUser;
            console.log('Created new user:', dbUser);
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          
          // Update last login time
          try {
            await db.update(users)
              .set({ lastLogin: new Date() })
              .where(eq(users.id, dbUser.id));
          } catch (error) {
            console.error('Error updating last login:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
