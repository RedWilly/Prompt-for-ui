import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { createInitialUserData } from "./user-setup";
import bcrypt from "bcryptjs";
import { toast } from "sonner";
import { getServerSession } from "next-auth/next";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // const user = await prisma.user.findUnique({
        //   where: { email: { equals: credentials.email, mode: 'insensitive' } }
        // });
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: credentials.email,
              mode: 'insensitive'
            }
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return user;
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ account, user, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: user.email,
              mode: 'insensitive'
            }
          },
          include: {
            accounts: true
          }
        });

        // If no user exists with this email, allow sign up
        if (!existingUser) {
          return true;
        }

        // If user exists and already has a Google account linked, allow sign in
        if (existingUser.accounts.some(acc => acc.provider === "google")) {
          return true;
        }

        // If user exists but doesn't have Google linked, check if they're signed in
        const session = await getServerSession(authOptions);
        if (session?.user.email?.toLowerCase() === user.email?.toLowerCase()) {
          // User is signed in with matching email, allow linking
          return true;
        }

        // User exists but not signed in or email doesn't match
        return "/auth/error?error=EmailMismatch";
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user }) {
      await createInitialUserData(user.id);
    },
  },
};