import { Markup, Scenes } from "telegraf";

import type { IncomingMessageType } from "@informerus/validators";
import { commandBlock } from "@informerus/utils";
import { ENV } from "@informerus/validators";

import type { InformerContext } from "../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

export const WebhookMenu = new Scenes.BaseScene<InformerContext>("WebhookMenu");

const createButton = createButtonHelper(WebhookMenu);

const CURL_PAYLOAD = JSON.stringify({
  topic: "Test Thread",
  body: "Test Message",
} satisfies IncomingMessageType);

const gotoMainMenuButton = createButton("В настройки чата", (ctx) =>
  ctx.navigator.goto("Introduction"),
);

WebhookMenu.enter(async (ctx) => {
  if (!ctx.from?.id) {
    return;
  }

  const { token } = await ctx.trpc.user.findById.query(ctx.from.id);

  const CURL_MESSAGES = {
    WINDOWS: [
      `curl -XPOST "${ENV.telegram.exampleUrl}"`,
      '		--header "content-type: application/json"',
      `		--header "Authorization: ${token}"`,
      `		--data ${JSON.stringify(CURL_PAYLOAD.replaceAll('"', '\\"'))}`,
    ],
    LINUX: [
      `curl -XPOST "${ENV.telegram.exampleUrl}"`,
      '		--header "content-type: application/json"',
      `		--header "Authorization: ${token}"`,
      `		--data ${JSON.stringify(CURL_PAYLOAD)}`,
    ],
  };

  const message = [
    "Ваш бот успешно зарегистрирован в чате\\.",
    'Вы можете воспользоваться нашим typescript клиентом\\: ["informer\\-client"](https\\://google.com)\\.',
    "Ваш персональный токен:",
    "`" + token.replaceAll("-", "\\-") + "`",
    "Вы можете протестировать работу бота через CURL\\.",
    "Для Windows\\:",
    commandBlock({
      content: CURL_MESSAGES.WINDOWS,
      platform: "windows",
      lang: "sh",
    }),
    "Для Linux\\:",
    commandBlock({
      content: CURL_MESSAGES.LINUX,
      platform: "linux",
      lang: "sh",
    }),
  ].join("\n");

  await ctx.editMessageText(message, {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([gotoMainMenuButton]),
  });
});
