import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import fastify from "fastify";

import { tryCatch } from "@informerus/utils";
import { ENV } from "@informerus/validators";

import { trpc } from "./client.js";

(() => {
  const app = fastify()
    .register(sensible)
    .register(cors, { origin: "*", credentials: true })
    .register(helmet);

  const options: fastify.FastifyListenOptions = {};

  if (ENV.api.host) {
    options.host = ENV.rest.host;
  }

  if (ENV.api.port) {
    options.port = ENV.rest.port;
  }

  app.post("/topic/message", async (request) => {
    const possiblePayload = request.body as any;

    return await trpc.messages.send.mutate({
      body: possiblePayload.body,
      topic: possiblePayload.topic,
    });
  });

  console.log("Options", options);

  void app.listen(options);
})();
