import { type inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { publicRouter } from "./public";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";

export const appRouter = router({
  public: publicRouter,
  auth: authRouter,
  admin: adminRouter,
});
export type AppRouter = typeof appRouter;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
