import { EventEmitter } from "node:events";
import { observable } from "@trpc/server/observable";
import * as R from "remeda";
import { z } from "zod";

import type { NewChatType } from "@informerus/validators";
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
      const user = await ctx.db.Users.findOneBy({
        telegramId: input.triggeredById,
      });

      if (!user) {
        return "no_user_found";
      }

      const chat = await ctx.db.Chats.findOneBy({ telegramId: input.chatId });

      if (chat) {
        return "already_exits";
      }

      await ctx.db.Chats.create({
        telegramId: input.chatId,
        topics: [],
        user,
      }).save();

      chatEvents.emit("created", input);
      return "created";
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
        if (alreadyExistingTopic.telegramId !== input.id) {
          alreadyExistingTopic.telegramId = input.id;
          await alreadyExistingTopic.save();

          return "already_exists_updated";
        }

        return "already_exists";
      }

      const newTopic = await ctx.db.Topics.create({
        telegramId: input.id,
        name: input.name,
      }).save();

      const chat = await ctx.db.Chats.findOneByOrFail({
        telegramId: input.chatId,
      });

      chat.topics.push(newTopic);
      await chat.save();

      return "created";
    }),
};
