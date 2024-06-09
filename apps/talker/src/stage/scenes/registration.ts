import { Markup, Scenes } from "telegraf";

import type { InformerContext } from "../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

export const RegistrationMenu = new Scenes.BaseScene<InformerContext>(
  "instructionMenu",
);

const createButton = createButtonHelper(RegistrationMenu);

const message = [
  "Привет\\!",
  "Для начала работы вы должны добавить меня в ваш суперчат и отправить команду \\/register",
].join("\n");

const cancelButton = createButton("Отмена", async (ctx) => {
  await ctx.navigator.goto("Introduction");
});

const imReadyButton = createButton("Готово", async (ctx) => {
  await ctx.navigator.goto("Webhook");
});

RegistrationMenu.enter(async (ctx) => {
  await ctx.editMessageText(message, {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([cancelButton, imReadyButton]),
  });
});
