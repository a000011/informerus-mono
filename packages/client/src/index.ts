import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@informerus/api";
import { ENV } from "@informerus/validators";

import "./polyfill.js";

const urlEnd = `${ENV.api.host}:${ENV.api.port}/trpc`;

export const createInformerClient = () => {
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
