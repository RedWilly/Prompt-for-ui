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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
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
          // Create new user account
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(), // Google accounts are pre-verified
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              }
            }
          });

          // Create initial user data (usage count, etc.)
          await createInitialUserData(newUser.id);
          return true;
        }

        // If user exists and already has a Google account linked, allow sign in
        if (existingUser.accounts.some(acc => acc.provider === "google")) {
          return true;
        }

        // If user exists but doesn't have Google linked, check if they're signed in
        const session = await getServerSession(authOptions);
        if (session?.user.email?.toLowerCase() === user.email?.toLowerCase()) {
          // Create the Google account link
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            }
          });
          return true;
        }

        // Users trying to sign in with unlinked Google accounts
        if (existingUser.password) {
          return "/auth/error?error=OAuth_Account_Not_Linked";
        }

        // Users trying to link Google accounts with mismatched emails
        if (session?.user.email && session.user.email.toLowerCase() !== user.email?.toLowerCase()) {
          return "/auth/error?error=EmailMismatch";
        }

        // If user exists but has no password, allow Google sign in and link account
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          }
        });
        return true;
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
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