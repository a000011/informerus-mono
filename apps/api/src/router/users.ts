import { randomUUID } from "crypto";
import { EventEmitter } from "node:events";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import type { NewUserType } from "@informerus/validators";
import { NewUserSchema } from "@informerus/validators";

import { publicProcedure } from "../trpc.js";

const userEvents = new EventEmitter();

export const user = {
  onNew: publicProcedure.subscription(() =>
    observable<NewUserType>((emit) => {
      const onAdd = (data: NewUserType) => {
        emit.next(data);
      };

      userEvents.on("add", onAdd);
      return () => {
        userEvents.off("add", onAdd);
      };
    }),
  ),

  findById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const user = await ctx.db.Users.findOneByOrFail({ telegramId: input });

    return {
      telegramId: user.telegramId,
      token: user.token,
      chatId: user.chat?.telegramId,
    };
  }),

  findByToken: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.Users.findOneByOrFail({ token: input });

      console.log(user.chat?.telegramId);
      console.log(typeof user.chat?.telegramId);

      return {
        telegramId: user.telegramId,
        token: user.token,
        chatId: user.chat?.telegramId,
      };
    }),

  create: publicProcedure
    .input(NewUserSchema)
    .mutation(async ({ input, ctx }) => {
      const alreadyExistingUser = await ctx.db.Users.findOneBy({
        telegramId: input.userId,
      });

      if (alreadyExistingUser) {
        return "already_exists";
      }

      await ctx.db.Users.create({
        telegramId: input.userId,
        token: randomUUID(),
      }).save();

      userEvents.emit("add", input);

      return "created";
    }),
};
