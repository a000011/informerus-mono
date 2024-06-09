import { EventEmitter } from "node:events";
import { observable } from "@trpc/server/observable";
import * as R from "remeda";
import { z } from "zod";

import type { IncomingMessageType, NewChatType } from "@informerus/validators";
import { NewChatSchema, NewTopicSchema } from "@informerus/validators";

import { publicProcedure } from "../trpc.js";

const chatEvents = new EventEmitter();

export const chat = {
  onNew: publicProcedure.subscription(() =>
    observable<NewChatType>((emit) => {
      const onAdd = (data: NewChatType) => {
        emit.next(data);
      };

      chatEvents.on("created", onAdd);
      return () => {
        chatEvents.off("created", onAdd);
      };
    }),
  ),

  create: publicProcedure
    .input(NewChatSchema)
    .mutation(async ({ input, ctx }) => {
      chatEvents.emit("add", input);

      const user = await ctx.db.Users.findOneByOrFail({
        telegramId: input.triggeredById,
      });

      await ctx.db.Chats.create({
        telegramId: input.chatId,
        topics: [],
        user,
      }).save();

      chatEvents.emit("created", input);
    }),

  getAllTopics: publicProcedure
    .input(z.object({ chatId: z.number() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.Chats.findOneByOrFail({
        telegramId: input.chatId,
      });
      return chat.topics.map(R.pick(["telegramId", "name"]));
    }),

  createTopic: publicProcedure
    .input(NewTopicSchema)
    .mutation(async ({ input, ctx }) => {
      const alreadyExistingTopic = await ctx.db.Topics.findOneBy({
        name: input.name,
        chat: { telegramId: input.chatId },
      });

      if (alreadyExistingTopic) {
        return "already_exists";
      }

      await ctx.db.Topics.create({
        telegramId: input.id,
        name: input.name,
      }).save();

      return "created";
    }),
};
