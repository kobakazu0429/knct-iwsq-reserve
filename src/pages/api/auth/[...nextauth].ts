import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return (
          profile &&
          Object.hasOwn(profile, "email_verified") &&
          (profile as any).email_verified
        );
      }
      return false; // Do different verification for other providers that don't have `email_verified`
    },
  },
};

export default NextAuth(authOptions);
