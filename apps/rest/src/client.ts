import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import { AppRouter } from "@informerus/api";
import { ENV } from "@informerus/validators";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://${ENV.api.host}:${ENV.api.port}/trpc`,
    }),
  ],
  transformer: SuperJSON,
});
