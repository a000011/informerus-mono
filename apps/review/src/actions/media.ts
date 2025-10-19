import { Markup } from "telegraf";
import type { BotType, MyContext } from "../index.js";
import { ENV } from "@informerus/validators";

const sendQuestion = async (ctx: MyContext) => {
  await ctx.reply(
    "Отправить эти фото/видео?",
    Markup.inlineKeyboard([
      Markup.button.callback(`подтвердить`, `submitPhoto`),
      Markup.button.callback(`отмена`, `cancelPhoto`),
    ]),
  );
};

export const addMediaActions = (bot: BotType) => {
  bot.on("photo", async (ctx) => {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];

    if (!photo) {
      throw Error("photo isa undef");
    }

    const fileId = photo.file_id;
    const file = await ctx.telegram.getFile(fileId);

    ctx.session.files.push({
      id: photo.file_id,
      format: "image",
      fileName: photo.file_id,
      filePath: `https://api.telegram.org/file/bot${ENV.review.token}/${file.file_path}`,
      mime_type: "image/png",
    });
    const groupId = ctx.message.media_group_id;

    if (groupId) {
      if (ctx.session.pendingGroupId !== groupId) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sendQuestion(ctx);
      }

      ctx.session.pendingGroupId = groupId;
    }

    if (!groupId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sendQuestion(ctx);
    }
  });

  bot.on("video", async (ctx) => {
    const video = ctx.message.video;

    const fileId = ctx.message.video.file_id;
    const file = await ctx.telegram.getFile(fileId);

    if (!video.mime_type) {
      throw Error("unknown video");
    }

    ctx.session.files.push({
      id: fileId,
      format: "video",
      fileName: video.file_id,
      filePath: `https://api.telegram.org/file/bot${ENV.review.token}/${file.file_path}`,
      mime_type: video.mime_type,
    });

    const groupId = ctx.message.media_group_id;

    if (groupId) {
      if (ctx.session.pendingGroupId !== groupId) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sendQuestion(ctx);
      }

      ctx.session.pendingGroupId = groupId;
    }

    if (!groupId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sendQuestion(ctx);
    }
  });

  //TODO
  bot.on("document", async (ctx) => {
    await ctx.reply("отправте другим форматом пожалуйста");
  });
};
