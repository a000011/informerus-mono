import path from "path";
import { Composer } from "telegraf";

import type { InformerContext } from "../context.js";

export const groupMessagesModule = new Composer<InformerContext>();

groupMessagesModule.settings(async (ctx) => {
  await ctx.telegram.setMyCommands([
    {
      command: "/register",
      description: "Регистрация вашего бота",
    },
  ]);
});

async function register(ctx: InformerContext): Promise<void> {
  if (!ctx.from?.id || !ctx.chat?.id) {
    return;
  }
  const message =
    "Привет, вам необходимо включить топики в вашей группе.\nПосле включения можете вызвать команду /register";

  await ctx.replyWithPhoto(
    { source: path.join(process.cwd(), "/src/img/admin.png") },
    { caption: message },
  );
}

groupMessagesModule.on("my_chat_member", async (ctx) => {
  const isJoinUpdate =
    ctx.update.my_chat_member.new_chat_member.status === "member";
  const isMe =
    ctx.update.my_chat_member.new_chat_member.user.id === ctx.botInfo.id;

  if (isJoinUpdate && isMe) {
    await ctx.reply("Привет. Я бот для рассылки сообщений по тредам!");
    await register(ctx);
  }
});

groupMessagesModule.command("register", async (ctx) => {
  await register(ctx);
});
