import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    } & DefaultSession['user']
  }

  interface JWT {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    isVerified?: boolean;
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    password?: string;
  }
}
