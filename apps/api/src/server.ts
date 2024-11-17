import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import ws from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

import { ENV } from "@informerus/validators";

import { appRouter } from "./root.js";
import { createTRPCContext } from "./trpc.js";

export const startServer = async () => {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
    },
  })
    .register(sensible)
    .register(ws)
    .register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      useWSS: true,
      trpcOptions: { router: appRouter, createContext: createTRPCContext },
    })
    .register(cors, { origin: "*", credentials: true })
    .register(helmet);

  app.get("/health", async (_, reply) => {
    await reply
      .code(200)
      .send({ statusCode: 200, status: "ok", uptime: process.uptime() });
  });

  const options: fastify.FastifyListenOptions = {};

  if (ENV.api.host) {
    options.host = ENV.api.host;
  }

  if (ENV.api.port) {
    options.port = ENV.api.port;
  }

  await app.listen(options);
};
