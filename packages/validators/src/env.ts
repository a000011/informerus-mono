import dotenv from "dotenv";
import { findUp } from "find-up";
import { z } from "zod";

const dotenvPath = await findUp(".env");

if (dotenvPath) {
  dotenv.config({ path: dotenvPath });
}

const createEnv = z.object({
  postgres: z.object({
    port: z.number().default(5432),
    host: z.string(),
    username: z.string(),
    password: z.string(),
  }),
  api: z.object({
    host: z.string().default("localhost"),
    port: z.number().default(5000),
    secret: z.string(),
  }),
  sender: z.object({
    token: z.string(),
  }),
  talker: z.object({
    exampleUrl: z.string(),
    token: z.string(),
  }),
  rest: z.object({
    port: z.number().default(5001),
    host: z.string().default("localhost"),
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
    secret: process.env.API_SECRET,
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
});
