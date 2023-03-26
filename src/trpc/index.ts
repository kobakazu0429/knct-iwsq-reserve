import { useMemo } from "react";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "./../server/routers";
import { getBaseUrl } from "../utils/url";

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
