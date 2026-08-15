import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { unstable_cache } from "next/cache";

const getPrisma = async () => (await import("./prisma")).default;

const getCachedUserByEmail = unstable_cache(
  async (email: string) => {
    const prisma = await getPrisma();
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, image: true },
    });
  },
  ["jwt-user-image"],
  { revalidate: 60, tags: ["user-image"] }
);

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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

        const prisma = await getPrisma();
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

  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Auto-create user in DB on first Google sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const prisma = await getPrisma();
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
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.picture = user.image && user.image.startsWith("data:")
          ? `/api/user/avatar?userId=${user.id}`
          : user.image || token.picture;
      }
      if (trigger === "update" && session?.image) {
        token.picture = session.image.startsWith("data:")
          ? `/api/user/avatar?userId=${token.sub}`
          : session.image;
      }
      // Sync DB user image to token using cached query
      if (token.email) {
        const dbUser = await getCachedUserByEmail(token.email);
        if (dbUser) {
          token.sub = dbUser.id;
          if (dbUser.image) {
            token.picture = dbUser.image.startsWith("data:")
              ? `/api/user/avatar?userId=${dbUser.id}`
              : dbUser.image;
          }
        }
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },
};
