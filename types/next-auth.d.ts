import type { DefaultUser } from "next-auth";
import type { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User extends DefaultUser {
    role: PrismaUser["role"];
  }
}
