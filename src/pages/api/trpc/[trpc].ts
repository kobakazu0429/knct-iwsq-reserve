import { initTRPC } from "@trpc/server";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { appRouter } from "../../../server/routers";

const t = initTRPC.create();

export const router = t.router;
export const procedure = t.procedure;

export default createNextApiHandler({
  router: appRouter,
  createContext: async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions);
    return { session };
  },
});
