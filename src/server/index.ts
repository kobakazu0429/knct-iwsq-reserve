import { appRouter } from "./../server/routers";

export const trpcServerSide = () => appRouter.createCaller({ session: null });
