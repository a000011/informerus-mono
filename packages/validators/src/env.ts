import dotenv from "dotenv";
import { findUp } from "find-up";
import { z } from "zod";

const dotenvPath = await findUp(".env");

if (dotenvPath) {
  dotenv.config({ path: dotenvPath });
}

const createEnv = z.object({
  postgres: z.object({
    port: z.number(),
    host: z.string(),
    username: z.string(),
    password: z.string(),
  }),
  api: z.object({
    connectionUrl: z.string(),
    host: z.string(),
    port: z.number(),
  }),
  sender: z.object({
    token: z.string(),
  }),
  talker: z.object({
    exampleUrl: z.string(),
    token: z.string(),
  }),
  rest: z.object({
    port: z.number(),
    host: z.string(),
  }),
  review: z.object({
    token: z.string(),
    senderGroupToken: z.string(),
  }),
  strapi: z.object({
    token: z.string(),
    host: z.string(),
  }),
});

export const ENV = createEnv.parse({
  postgres: {
    port: Number(process.env.POSTGRES_PORT),
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  },
  api: {
    connectionUrl: process.env.API_HOST_CONNECTION,
    host: process.env.API_HOST,
    port: Number(process.env.API_PORT),
  },
  sender: {
    token: process.env.SENDER_TOKEN,
  },
  talker: {
    exampleUrl: process.env.TALKER_REST_EXAMPLE_URL,
    token: process.env.TALKER_TOKEN,
  },
  rest: {
    port: Number(process.env.REST_PORT),
    host: process.env.REST_HOST,
  },
  review: {
    token: process.env.REVIEW_TOKEN,
    senderGroupToken: process.env.SENDER_GROUP_TOKEN,
  },
  strapi: {
    host: process.env.STRAPI_HOST,
    token: process.env.STRAPI_TOKEN,
  },
});
