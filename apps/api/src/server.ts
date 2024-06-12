import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import ws from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

import { ENV } from "@informerus/validators";

import { appRouter } from "./root.js";
import { createTRPCContext } from "./trpc.js";

(() => {
  const app = fastify({ logger: true })
    .register(sensible)
    .register(ws)
    .register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      useWSS: true,
      trpcOptions: { router: appRouter, createContext: createTRPCContext },
    })
    .register(cors, { origin: "*", credentials: true })
    .register(helmet);

  const options: fastify.FastifyListenOptions = {};

  if (ENV.api.host) {
    options.host = ENV.api.host;
  }

  if (ENV.api.port) {
    options.port = ENV.api.port;
  }

  void app.listen(options);
})();
