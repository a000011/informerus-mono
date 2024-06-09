import type _fastify from "fastify";
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@zutina/api";

export const trpc = createTRPCReact<AppRouter>();
