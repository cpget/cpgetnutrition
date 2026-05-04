import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true, // Required to link Google accounts to seeded DB users
    }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;

      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // ROOT CAUSE FIX: NextAuth's PrismaAdapter creates the user AFTER the signIn callback.
      // Since we throw an error for unapproved users, the flow is aborted and the adapter 
      // never saves them. We MUST manually create them here so they appear as "pending"
      // in the teacher dashboard.
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            password: "", // satisfies TS strict string rule while VS Code caches old schema types
            name: user.name || profile?.name || "Unknown Student",
            isApproved: false,
            role: "STUDENT",
          },
        });
      }

      if (!dbUser.isApproved) {
        throw new Error("Account not approved by admin");
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // `user` is the database user object injected by PrismaAdapter on initial sign-in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "STUDENT";
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
}