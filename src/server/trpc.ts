import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getSession } from "next-auth/react";
import { type Role, userRoleHelper, userRoleExtender } from "../prisma/user";

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getSession({ req: opts.req });
  return {
    session,
  };
};

const t = initTRPC.context<typeof createContext>().create();

const roleGuard = (leastRole: Role) => {
  return t.middleware(({ next, ctx }) => {
    const role = ctx.session?.user?.role;
    const roleHelper = userRoleHelper(role);

    if (!role || roleHelper.isAnonymous) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    if (!userRoleExtender(role).includes(leastRole)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `required ${leastRole} Role at least`,
      });
    }

    return next({
      ctx: {
        session: {
          ...ctx.session!,
          user: {
            ...ctx.session!.user,
            roleHelper,
          },
        },
      },
    });
  });
};

export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = publicProcedure.use(roleGuard("GUEST"));
export const taProcedure = publicProcedure.use(roleGuard("TEACHING_ASSISTANT"));
export const adminProcedure = publicProcedure.use(roleGuard("ADMIN"));
