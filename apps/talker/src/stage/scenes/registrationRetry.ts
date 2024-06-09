import { Markup, Scenes } from "telegraf";

import type { InformerContext } from "../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

export const RegistrationRetry = new Scenes.BaseScene<InformerContext>(
  "registrationRetry",
);

const createButton = createButtonHelper(RegistrationRetry);

const retryButton = createButton("Попробовать ещё раз", (ctx) =>
  ctx.navigator.goto("Registration"),
);
const mainMenuButton = createButton("В начало", (ctx) =>
  ctx.navigator.goto("Introduction"),
);

const message = [
  "Время регистрации бота прошло, но вы можете попробовать ещё раз или вернуться в главное меню",
].join("\n");

RegistrationRetry.enter(async (ctx) => {
  await ctx.editMessageText(message, {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([[retryButton, mainMenuButton]]),
  });
});
