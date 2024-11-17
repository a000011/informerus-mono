import type { CreateTRPCProxyClient } from "@trpc/client";
import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@informerus/api";

import "./polyfill.js";

export const createInformerClient = (
  host: string,
): CreateTRPCProxyClient<AppRouter> => {
  const urlEnd = `${host}/trpc`;
  const wsClient = createWSClient({ url: `ws://${urlEnd}` });

  return createTRPCProxyClient<AppRouter>({
    links: [
      splitLink({
        condition(op) {
          return op.type === "subscription";
        },
        true: wsLink({ client: wsClient }),
        false: httpBatchLink({ url: `http://${urlEnd}` }),
      }),
    ],
    transformer: SuperJSON,
  });
};
