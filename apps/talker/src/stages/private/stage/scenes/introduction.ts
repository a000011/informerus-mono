import type { Middleware } from "telegraf";
import { Markup, Scenes } from "telegraf";
import { sanitizeMarkdown } from "telegram-markdown-sanitizer";

import type { InformerContext } from "../../../context.js";
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
  `Для инструкции по подключению нажмите "${continueButton}"`,
].join("\n");

const startMiddleware: Middleware<InformerContext> = async (ctx) => {
  await ctx.replyWithMarkdownV2(
    sanitizeMarkdown(message),
    Markup.keyboard([continueButton]).resize(),
  );
};

IntroductionMenu.enter(startMiddleware);
IntroductionMenu.start(startMiddleware);
