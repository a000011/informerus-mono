import { session, Telegraf } from "telegraf";

import { createInformerClient } from "@informerus/client";
import { ENV } from "@informerus/validators";

export const trpc = createInformerClient();

const bot = new Telegraf(ENV.sender.token);

bot.catch((err) => console.error(err));
bot.use(session());
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

trpc.messages.onNew.subscribe(undefined, {
  onData: async ({ body, topic, token }) => {},
});

bot.settings(async (ctx) => {
  await ctx.telegram.setMyCommands([
    { command: "/register1", description: "Регистрация вашего бота" },
  ]);
});

bot.command("register1", async (ctx) => {
  if (!ctx.from.id) {
    return;
  }

  const chatStatus = await trpc.chats.create.mutate({
    chatId: ctx.chat.id,
    triggeredById: ctx.from.id,
  });

  switch (chatStatus) {
    case "already_exits":
      await ctx.reply("Этот чат уже зарегистрирован");
      break;
    case "no_user_found":
      await ctx.reply("Вам нужно пройти регистрацию в боте");
      break;
    case "created":
      await ctx.reply("Бот зареган");
      break;
  }
});

void bot.launch();
