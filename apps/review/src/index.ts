import { Context, Markup, session, Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";
import { Update } from "telegraf/types";
import { fetchAdresses } from "./strapi/index.js";
import { addMediaActions } from "./actions/media.js";
import { submitReview } from "./actions/submitReview.js";

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
    content: string;
    mark: number;
    pendingGroupId: string;
    files: FilesType;
  };
} & Context<U>;

//TODO
const marks = Array.from({ length: 5 }).map((_, index) => index + 1);

const bot = new Telegraf<MyContext>(ENV.review.token);
export type BotType = typeof bot;

bot.use(
  session({
    defaultSession: () => ({
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

bot.start(async (ctx) => {
  const adresses = (await fetchAdresses()).data;

  await ctx.reply(
    "Выберите филиал:",
    Markup.inlineKeyboard(
      adresses.map((adr) =>
        Markup.button.callback(adr.adress, `adr_${adr.documentId}`),
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

    await ctx.editMessageText(adress.adress);

    ctx.session.filial = adress.adress;

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

    await ctx.reply("Напишите ваш отзыв");
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
  await ctx.editMessageText("Если хотите можете, можете поделится фото/видео");

  await ctx.answerCbQuery();

  await ctx.reply(
    "Благодарим вас за отзыв!\n" +
      "Ваша обратная связь поможет нам стать еще лучше!\n" +
      "С любовью, Ваша Лавка №1",
  );

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  submitReview(ctx.session);
  ctx.session = {
    pendingGroupId: "",
    content: "",
    filial: "",
    mark: 0,
    files: [],
  };
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
