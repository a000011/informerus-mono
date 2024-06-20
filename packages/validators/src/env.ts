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
    host: z.string(),
    port: z.number(),
  }),
  sender: z.object({
    apiHost: z.string(),
    token: z.string(),
  }),
  talker: z.object({
    apiHost: z.string(),
    exampleUrl: z.string(),
    token: z.string(),
  }),
  rest: z.object({
    apiHost: z.string(),
    port: z.number(),
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
    host: process.env.API_HOST,
    port: Number(process.env.API_PORT),
  },
  sender: {
    apiHost: process.env.SENDER_API_HOST,
    token: process.env.SENDER_TOKEN,
  },
  talker: {
    apiHost: process.env.TALKER_API_HOST,
    exampleUrl: process.env.TALKER_REST_EXAMPLE_URL,
    token: process.env.TALKER_TOKEN,
  },
  rest: {
    apiHost: process.env.REST_API_HOST,
    port: Number(process.env.REST_PORT),
    host: process.env.REST_HOST,
  },
});
