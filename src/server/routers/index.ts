import { type inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { eventsRouter } from "./events";
import { usersRouter } from "./users";

export const appRouter = router({
  events: eventsRouter,
  users: usersRouter,
});
export type AppRouter = typeof appRouter;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
