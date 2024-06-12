import type { Context, NarrowedContext } from "telegraf";
import type { Update } from "telegraf/types";
import type * as tt from "telegraf/types";
import { Composer } from "telegraf";

import type { InformerContext } from "../context.js";

export const superchatMessagesModule = new Composer<InformerContext>();

superchatMessagesModule.settings(async (ctx) => {
  await ctx.telegram.setMyCommands([
    {
      command: "/register",
      description: "Регистрация вашего бота (если вы в приватной группе)",
    },
  ]);
});

async function register(ctx: InformerContext): Promise<void> {
  if (!ctx.from?.id || !ctx.chat?.id) {
    return;
  }

  const chatStatus = await ctx.trpc.chats.create.mutate({
    chatId: ctx.chat.id,
    triggeredById: ctx.from.id,
  });

  const replyMap: Record<typeof chatStatus, () => Promise<unknown>> = {
    already_exits: () => ctx.reply("Этот чат уже зарегистрирован"),
    no_user_found: () => ctx.reply("Вам нужно пройти регистрацию в боте"),
    created: () => ctx.reply("Бот зарегистрирован"),
  };

  await replyMap[chatStatus]();
}

superchatMessagesModule.on("my_chat_member", async (ctx) => {
  const isJoinUpdate =
    ctx.update.my_chat_member.new_chat_member.status === "member";
  const isMe =
    ctx.update.my_chat_member.new_chat_member.user.id === ctx.botInfo.id;

  if (isJoinUpdate && isMe) {
    await ctx.reply("Привет. Я бот для рассылки сообщений по тредам!");
    await register(ctx);
  }
});

superchatMessagesModule.command("register", async (ctx) => {
  await register(ctx);
});
