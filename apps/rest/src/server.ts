import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import fastify from "fastify";

import { createInformerClient } from "@informerus/client";
import { ENV } from "@informerus/validators";

export const trpc = createInformerClient();

(() => {
  const app = fastify({ logger: true })
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
      token: request.headers.authorization!,
    });
  });

  void app.listen(options);
})();
