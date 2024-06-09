import { chat } from "./router/chats.js";
import { messages } from "./router/messages.js";
import { user } from "./router/users.js";
import { createTRPCRouter } from "./trpc.js";

export const appRouter = createTRPCRouter({
  chats: createTRPCRouter(chat),
  messages: createTRPCRouter(messages),
  user: createTRPCRouter(user),
});

// export type definition of API
export type AppRouter = typeof appRouter;
