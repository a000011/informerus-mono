import type { Middleware } from "telegraf";
import { Markup, Scenes } from "telegraf";

import type { InformerContext } from "../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

export const IntroductionMenu = new Scenes.BaseScene<InformerContext>(
  "introductionMenu",
);

const createButton = createButtonHelper(IntroductionMenu);

const continueButton = createButton("Дальше", async (ctx) => {
  await ctx.navigator.goto("Registration");
});

const message = [
  "Привет",
  "Это бот, позволяющий создать систему логгирования на основе [TelegramThreads](https://journal.tinkoff.ru/news/telegram-forums/)",
  `Для инструкции по подключению нажмите "${continueButton.text}"`,
].join("\n");

const startMiddleware: Middleware<InformerContext> = async (ctx) => {
  try {
    await ctx.editMessageText(message, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([continueButton]),
    });
  } catch {
    await ctx.replyWithMarkdownV2(message, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([continueButton]),
    });
  }
};

IntroductionMenu.enter(startMiddleware);
IntroductionMenu.start(startMiddleware);
