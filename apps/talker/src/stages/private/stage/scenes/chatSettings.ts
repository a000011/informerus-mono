import { Markup, Scenes } from "telegraf";
import { sanitizeMarkdown } from "telegram-markdown-sanitizer";

import { tryCatchAsync } from "@informerus/utils";

import type { InformerContext } from "../../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

export const ChatSettingsMenu = new Scenes.BaseScene<InformerContext>(
  "ChatSettings",
);

const createButton = createButtonHelper(ChatSettingsMenu);

const deleteGroupButton = createButton(
  "Отправить тестовое сообщение",
  async (ctx) => {
    if (!ctx.session.user) {
      throw new Error("No user at deleteGroupButton");
    }

    await ctx.trpc.messages.send.mutate({
      body: `Тестовое сообщение от @${ctx.from.username}`,
      topic: "Debug",
      token: ctx.session.user.token,
    });
    await ctx.reply("Отправил сообщение в тред 'Debug'");
  },
);

const giveMeChatLink = createButton("Ссылка на чат", async (ctx) => {
  if (!ctx.session.user) {
    throw new Error("No user at giveMeChatLink");
  }

  if (!ctx.session.user.chatId) {
    await ctx.reply("У вас нет чата");
    return ctx.navigator.goto("Introduction");
  }

  // ts scope things
  const chatId = ctx.session.user.chatId;

  const [link, getLinkError] = await tryCatchAsync(() =>
    ctx.telegram.createChatInviteLink(chatId),
  );

  if (getLinkError) {
    await ctx.reply("Ошибка получения ссылки на чат");
    return ctx.navigator.goto("Introduction");
  }

  return ctx.replyWithMarkdownV2(
    sanitizeMarkdown(
      [
        "Ссылка на чат, в котором оперирует бот:",
        `[Чат](${link.invite_link})`,
      ].join("\n"),
    ),
  );
});

ChatSettingsMenu.enter(async (ctx) => {
  await ctx.replyWithMarkdownV2(
    sanitizeMarkdown("Настройка вашего чата"),
    Markup.keyboard([deleteGroupButton, giveMeChatLink]).resize(),
  );
});
