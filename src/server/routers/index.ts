import { type inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { eventsRouter } from "./events";

export const appRouter = router({
  events: eventsRouter,
});
export type AppRouter = typeof appRouter;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
