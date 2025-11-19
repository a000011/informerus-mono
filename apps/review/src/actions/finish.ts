import { Markup } from "telegraf";
import type { MyContext } from "../index.js";
import { clearCtx } from "../index.js";
import { submitReview } from "./submitReview.js";

export const finishCollback = async (ctx: MyContext) => {
  // await ctx.editMessageText("Если хотите можете, можете поделится фото/видео");

  let text =
    "Благодарим вас за отзыв!\n" +
    "Ваша обратная связь поможет нам стать еще лучше!\n" +
    "С любовью, ваша Лавка №1";

  if (ctx.session.mark < 4) {
    text =
      "Спасибо за ваше обращение! 💬\n\n" +
      "Мы уже передали информацию в службу поддержки.\n\n" +
      "В ближайшее время с вами свяжется наш специалист, чтобы помочь разобраться в ситуации 🙏🏻\n\n" +
      "Пожалуйста, ожидайте!\n" +
      "С заботой, ваша Лавка №1";
  }
  if (ctx.session.mark > 3) {
    text =
      "Спасибо, что поделились с нами впечатлениями 💛!\n\n" +
      "Благодаря вам мы становимся ещё лучше каждый день!\n\n" +
      "С любовью, ваша Лавка №1";
  }

  await ctx.reply(
    text,
    Markup.inlineKeyboard([
      Markup.button.callback(`Отправить отзыв заново`, "newStart"),
    ]),
  );

  const data = { ...ctx.session };

  await submitReview(data);
  clearCtx(ctx);
};
