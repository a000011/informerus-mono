import path from "path";
import { Markup, Scenes } from "telegraf";
import { sanitizeMarkdown } from "telegram-markdown-sanitizer";

import { sleepMs } from "@informerus/utils";

import type { InformerContext } from "../../../context.js";
import { createButtonHelper } from "../buttonHelper.js";

const images = [
  path.join(process.cwd(), "/src/img/enableTopics.jpg"),
  path.join(process.cwd(), "/src/img/addToGroup1.jpg"),
  path.join(process.cwd(), "/src/img/addToGroup2.jpg"),
  path.join(process.cwd(), "/src/img/admin.png"),
];

export const RegistrationMenu = new Scenes.BaseScene<InformerContext>(
  "instructionMenu",
);

const createButton = createButtonHelper(RegistrationMenu);

const message = [
  "Для начала вы должны:",
  "	- Включить в вашей группе топики",
  "	- Добавить меня в вашу группу",
  "	- Добавить меня в админы (необходимо для создания топиков)",
  "	- Выполнить команду '/register' если группа приватная",
].join("\n");

const cancelButton = createButton("Отмена", async (ctx) => {
  console.log("CANCEL");
  await ctx.navigator.goto("Introduction");
});

const waitForRegistration = (ctx: InformerContext) =>
  new Promise<"ok">((resolve) => {
    ctx.trpc.chats.onNew.subscribe(undefined, {
      onData: ({ triggeredById }) => {
        if (triggeredById === ctx.from?.id) {
          resolve("ok");
        }
      },
    });
  });

const waitForTimeout = () => sleepMs(45000).then(() => "timeout" as const);

RegistrationMenu.enter(async (ctx) => {
  const possibleUser = await ctx.trpc.user.findById.query(ctx.from?.id!);

  if (possibleUser.chatId) {
    await ctx.replyWithMarkdownV2(sanitizeMarkdown("У вас уже есть группа"));
    await ctx.navigator.goto("Introduction");
    return;
  }

  const [documentationPhotos] = await ctx.replyWithMediaGroup(
    images.map((image, index) => {
      return {
        type: "photo",
        media: { source: image },
        caption: !index ? message : undefined,
      };
    }),
  );

  if (!documentationPhotos?.message_id) {
    throw new Error("No original post found");
  }

  await ctx.replyWithMarkdownV2(
    sanitizeMarkdown("А я пока жду"),
    Markup.keyboard([cancelButton]).resize(),
  );

  void (async () => {
    const result = await Promise.race([
      waitForRegistration(ctx),
      waitForTimeout(),
    ]);

    // Если пользователь отменил регистрацию, то забиваем на всё это
    if (ctx.session.currentScene !== "Registration") {
      return;
    }

    if (result === "timeout") {
      return await ctx.navigator.goto("RegistrationRetry");
    }

    return await ctx.navigator.goto("Webhook");
  })();
});
