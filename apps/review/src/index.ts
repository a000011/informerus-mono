import type { Context } from "telegraf";
import { Markup, session, Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";
import type { Update } from "telegraf/types";
import { fetchAdresses } from "./strapi/index.js";
import { addMediaActions } from "./actions/media.js";
import { submitReview } from "./actions/submitReview.js";
import { createInformerClient } from "@informerus/trpc-client";

export type FilesType = {
  id: string;
  format: "image" | "video";
  fileName: string;
  filePath: string;
  mime_type: string;
}[];

export type MyContext<U extends Update = Update> = {
  session: {
    filial: string;
    userName: string;
    publickName: string;
    content: string;
    mark: number;
    pendingGroupId: string;
    files: FilesType;
  };
} & Context<U>;

const marks = Array.from({ length: 5 }).map((_, index) => index + 1);

export const trpc = createInformerClient(ENV.api.connectionUrl);

const bot = new Telegraf<MyContext>(ENV.review.token);
export type BotType = typeof bot;

bot.use(
  session({
    defaultSession: () => ({
      userName: "",
      publickName: "",
      pendingGroupId: "",
      content: "",
      filial: "",
      mark: 0,
      files: [],
      mime_type: "",
    }),
  }),
);

addMediaActions(bot);

bot.catch(async (err, ctx) => {
  console.error(`Ошибка для пользователя ${ctx.from?.id}:`, err);
  ctx.session = {
    userName: "",
    publickName: "",
    pendingGroupId: "",
    content: "",
    filial: "",
    mark: 0,
    files: [],
  };
  // await trpc.messages.send.mutate({
  //   body: (err as Error).message,
  //   token: ENV.review.senderGroupToken,
  //   topic: "Ошибки",
  // });
});

bot.start(async (ctx) => {
  const adresses = (await fetchAdresses()).data;
  ctx.session.userName = ctx.message.from.username ?? "";
  ctx.session.publickName = `${ctx.message.from.first_name} ${ctx.message.from.last_name}`;

  await ctx.reply(
    "Здравствуйте!\n" +
      "Мы очень рады, что вы заглянули в\n" +
      '“Лавку N1" Поделитесь впечатлением\n' +
      "о визите — это займёт всего минуту.\n" +
      "Выберите филиал, где вы были 👇",
    Markup.inlineKeyboard(
      adresses.map((adr) =>
        Markup.button.callback(adr.Address, `adr_${adr.documentId}`),
      ),
      {
        columns: 1,
      },
    ),
  );
});

bot.action("newStart", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.userName = ctx.from.username ?? "";
  ctx.session.publickName = `${ctx.from.first_name} ${ctx.from.last_name}`;

  const adresses = (await fetchAdresses()).data;

  await ctx.reply(
    "Здравствуйте!\n" +
      "Мы очень рады, что вы заглянули в\n" +
      '“Лавку N1" Поделитесь впечатлением\n' +
      "о визите — это займёт всего минуту.\n" +
      "Выберите филиал, где вы были 👇",
    Markup.inlineKeyboard(
      adresses.map((adr) =>
        Markup.button.callback(adr.Address, `adr_${adr.documentId}`),
      ),
      {
        columns: 1,
      },
    ),
  );
});

function predicateFn(callbackData: string) {
  const match = callbackData.match(/^adr/);

  return !!match;
}

//@ts-expect-error is not assignable
bot.action(predicateFn, async (ctx) => {
  await ctx.answerCbQuery();

  const callbackData = (ctx.callbackQuery as { data: string }).data;

  const match = callbackData.match(/adr_(.+)/);
  if (match) {
    const numberPart = match[1];

    const adresses = (await fetchAdresses()).data;

    const adress = adresses.find((el) => el.documentId === numberPart);

    if (!adress) {
      throw Error("Can not find address");
    }

    await ctx.editMessageText(adress.Address);
    ctx.session.filial = adress.Address;

    await ctx.reply(
      "Отлично! Теперь оцените, как всё прошло ⭐️",
      Markup.inlineKeyboard(
        marks.map((mark, index) =>
          Markup.button.callback(`⭐️${mark}`, `mark${index}`),
        ),
        {
          columns: 5,
        },
      ),
    );
  }
});

//оценка
marks.forEach((mark, index) => {
  bot.action(`mark${index}`, async (ctx) => {
    ctx.session.mark = mark;

    await ctx.editMessageText(`⭐️${mark}`);

    await ctx.reply(
      "Благодарим за вашу оценку\n" +
        "Напишите, пожалуйста, что вам\n" +
        "понравилось, а что нужно доработать?",
    );
  });
});

bot.on("text", async (ctx) => {
  if (ctx.session.mark !== 0 && ctx.session.content === "") {
    ctx.session.content = ctx.message.text;
    await ctx.reply(
      "Если хотите можете, можете поделится фото/видео",
      Markup.inlineKeyboard([
        Markup.button.callback(`Пропустить`, `finishReview`),
      ]),
    );
  }
});

bot.action("cancelPhoto", async (ctx) => {
  ctx.session.files = [];
  await ctx.reply(
    "Если хотите можете, можете поделится фото/видео",
    Markup.inlineKeyboard([
      Markup.button.callback(`Пропустить`, `finishReview`),
    ]),
  );
});

bot.action(["finishReview", "submitPhoto"], async (ctx) => {
  // await ctx.editMessageText("Если хотите можете, можете поделится фото/видео");
  await ctx.deleteMessage();

  await ctx.answerCbQuery();

  if (ctx.session.mark < 3) {
    await ctx.reply(
      "Ваш отзыв передан в службу\n" +
        "поддержки, в ближайшее время с вами\n" +
        "свяжется наш сотрудник для решения\n" +
        "сложившейся ситуации. Пожалуйста,\n" +
        "ожидайте.",
      Markup.inlineKeyboard([
        Markup.button.callback(`Отправить отзыв заново`, "newStart"),
      ]),
    );
  } else {
    await ctx.reply(
      "Благодарим вас за отзыв!\n" +
        "Ваша обратная связь поможет нам стать еще лучше!\n" +
        "С любовью, Ваша Лавка №1",
      Markup.inlineKeyboard([
        Markup.button.callback(`Отправить отзыв заново`, "newStart"),
      ]),
    );
  }

  void (async () => {
    await submitReview(ctx.session);

    ctx.session.pendingGroupId = "";
    ctx.session.content = "";
    ctx.session.filial = "";
    ctx.session.mark = 0;
    ctx.session.files = [];
  })();
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
