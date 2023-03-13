import { type inferRouterOutputs } from "@trpc/server";
import { mergeRouters } from "../trpc";
import { eventsRouter } from "./events";

export const appRouter = mergeRouters(eventsRouter);
export type AppRouter = typeof appRouter;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
