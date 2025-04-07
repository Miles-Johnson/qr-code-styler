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
          console.log('Google sign-in attempt for:', user.email);
          console.log('Current NODE_ENV:', process.env.NODE_ENV);
          
          // Check if user exists
          let dbUser = await getUserByEmail(user.email);
          console.log('Database lookup result:', dbUser ? 'User found' : 'User not found');
          
          // If user doesn't exist, create them
          if (!dbUser) {
            console.log('Attempting to create new user for:', user.email);
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
            console.log('Successfully created new user:', dbUser);
          }

          // Ensure the user object passed to JWT has the database ID
          if (dbUser?.id) {
            user.id = dbUser.id; // Attach the database ID
            user.role = dbUser.role; // Attach the role as well
          } else {
            console.error('Could not determine dbUser ID in signIn for', user.email);
            return false; // Prevent sign-in if we can't get the ID
          }

          return true;
        } catch (error) {
          console.error('Detailed error in signIn callback:', {
            error,
            email: user.email,
            provider: account.provider,
            env: process.env.NODE_ENV
          });
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // If user object has ID (passed from signIn), use it directly
      if (user?.id) {
        token.id = user.id;
        token.role = user.role; // Role should also be passed from signIn

        // Update last login time using the direct ID
        try {
          await db.update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));
        } catch (error) {
          console.error('Error updating last login (direct ID):', error);
        }
      }
      // Fallback: If ID isn't on user, try email lookup (e.g., for credentials flow)
      else if (user?.email) {
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
