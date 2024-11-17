import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type _fastify from "fastify";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";

import { createDatabaseConnection } from "@informerus/db";
import { ENV } from "@informerus/validators";

const db = await createDatabaseConnection({
  host: ENV.postgres.host,
  port: ENV.postgres.port,
  password: ENV.postgres.password,
  username: ENV.postgres.username,
});

export const createTRPCContext = ({
  req,
  res,
}: CreateFastifyContextOptions) => {
  return {
    fastify: req.server,
    db,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
