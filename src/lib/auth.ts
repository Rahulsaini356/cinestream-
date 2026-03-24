import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email + Password (credentials)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Auto-create user in DB on first Google sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || "",
              image: user.image || "",
              password: "", // Google users have no password
            },
          });
        } else if (existingUser.image !== user.image && user.image) {
          // Update Google avatar on subsequent sign-ins
          await prisma.user.update({
            where: { email: user.email! },
            data: { image: user.image },
          });
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      // For Google users, get the DB id
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },
};
