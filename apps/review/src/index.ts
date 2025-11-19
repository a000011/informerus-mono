import type { Context } from "telegraf";
import { Markup, session, Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";
import type { Update } from "telegraf/types";
import { fetchAdresses } from "./strapi/index.js";
import { addMediaActions } from "./actions/media.js";
import { createInformerClient } from "@informerus/trpc-client";
import { Postgres } from "@telegraf/session/pg";
import { finishCollback } from "./actions/finish.js";

const store = Postgres<{
  session: {
    filial: string;
    userName: string;
    publickName: string;
    content: string;
    mark: number;
    pendingGroupId: string;
    files: FilesType;
  };
}>({
  host: ENV.postgres.host,
  port: ENV.postgres.port,
  database: "telegraf",
  user: ENV.postgres.username,
  password: ENV.postgres.password,
});

//TODO сдлеать обработку меди с текстом

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
    phoneNumber: string;
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
    //@ts-expect-error type mismatch
    store: store,
    defaultSession: () => ({
      userName: "",
      publickName: "",
      phoneNumber: "",
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
    phoneNumber: "",
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

export const clearCtx = (ctx: MyContext) => {
  ctx.session.pendingGroupId = "";
  ctx.session.content = "";
  ctx.session.filial = "";
  ctx.session.mark = 0;
  ctx.session.files = [];
  ctx.session.phoneNumber = "";
};

bot.start(async (ctx) => {
  clearCtx(ctx);
  const adresses = (await fetchAdresses()).data;
  ctx.session.userName = ctx.message.from.username ?? "";
  ctx.session.publickName = `${ctx.message.from.first_name} ${ctx.message.from.last_name ?? ""}`;

  const text =
    " Здравствуйте!\n\n" +
    "Мы очень рады, что вы заглянули в\n" +
    "«Лавку №1» ☺️!\n\n" +
    "Поделитесь вашим впечатлением\n" +
    "о визите, это займёт всего минуту.\n\n" +
    "Выберите адрес ресторана, в котором вы были";

  await ctx.reply(
    text,
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
      "Отлично!\nКак бы вы оценили свой визит по 5-балльной шкале⭐️? Мы все поймем по звёздам 🤩",
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
      "Спасибо за вашу оценку!☺️\n\n" +
        "Расскажите, пожалуйста, что вам понравилось и что, на ваш взгляд, можно улучшить?",
    );
  });
});

bot.on("text", async (ctx) => {
  if (ctx.session.mark !== 0 && ctx.session.content === "") {
    ctx.session.content = ctx.message.text;
    // await ctx.reply(
    //   " Спасибо, что поделились с нами впечатлениями 💛!\n\n" +
    //     "Благодаря вам мы становимся ещё лучше каждый день!\n\n" +
    //     "С любовью, Ваша Лавка №1",
    // );
    await ctx.reply(
      "При желании можете поделиться фото или видео 📸",
      Markup.inlineKeyboard([
        Markup.button.callback(`Пропустить`, `answerContact`),
      ]),
    );
  }
});

bot.action("cancelPhoto", async (ctx) => {
  ctx.session.files = [];
  await ctx.reply(
    "При желании можете поделиться фото или видео 📸",
    Markup.inlineKeyboard([
      Markup.button.callback(`Пропустить`, `answerContact`),
    ]),
  );
});

const cancelPhotoText = "Не отправлять";

bot.action("answerContact", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();

  const keyboard = Markup.keyboard([
    Markup.button.contactRequest("📱 Поделиться телефоном"),
  ])
    .oneTime()
    .resize();

  await ctx.reply(
    "Оставьте нам свой номер телефона для обратной связи 📱",
    keyboard,
  );
  await ctx.reply(
    `Если не хотите - нажмите «${cancelPhotoText}»`,
    Markup.inlineKeyboard([
      Markup.button.callback(cancelPhotoText, `cancelContact`),
    ]),
  );
});

bot.on("contact", async (ctx) => {
  try {
    const contact = ctx.message.contact;

    if (contact.user_id === ctx.from.id) {
      ctx.session.phoneNumber = contact.phone_number;
    }
  } catch (e) {
    console.log("ошибка при отправке котакта");
  }

  await finishCollback(ctx);
});

bot.action(["cancelContact"], async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("👌", Markup.removeKeyboard());

  await finishCollback(ctx);
});

bot.action(["finishReview"], async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();

  await finishCollback(ctx);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
