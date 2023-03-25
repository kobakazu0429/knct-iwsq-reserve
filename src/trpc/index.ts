import { useMemo } from "react";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "./../server/routers";

const getBaseUrl = () => {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const useTrpc = () => {
  const client = useMemo(() => {
    return createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    });
  }, []);
  return client;
};

export type Trpc = ReturnType<typeof useTrpc>;
