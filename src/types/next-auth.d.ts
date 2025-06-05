import "next-auth"
import { DefaultSession } from "next-auth";

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isVerified: boolean;
      username: string;
      email?: string;
      image?: string;
    } & DefaultSession['user']
  }

  interface JWT {
    id: string;
    isVerified: boolean;
    username: string;
    email?: string;
    image?: string;
  }

  interface User {
    id: string;
    isVerified: boolean;
    username: string;
    email?: string;
    image?: string;
    password?: string;
  }
}