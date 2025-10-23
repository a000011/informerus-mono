import { ENV } from "@informerus/validators";
import { fetchDocumentMedia, uploadReview } from "../strapi/index.js";
import { trpc } from "../index.js";
import type { FilesType } from "../index.js";
import { createDatabaseConnection } from "../bd/craete.js";

const db = await createDatabaseConnection({
  host: ENV.postgres.host,
  port: ENV.postgres.port,
  password: ENV.postgres.password,
  username: ENV.postgres.username,
});

export const submitReview = async (data: {
  filial: string;
  userName: string;
  publickName: string;
  content: string;
  mark: number;
  pendingGroupId: string;
  files: FilesType;
}) => {
  const docId = await uploadReview(data);
  const media = await fetchDocumentMedia(docId);
  const mediaURLs = media.map(
    (file, index) => `[Файл ${index + 1}](${ENV.strapi.host}${file.url})`,
  );
  const now = new Date();

  const notifyContent =
    `Филиал: ${data.filial} \n` +
    `Оценка: ${data.mark}/5\n` +
    `Комментарий: ${data.content}\n` +
    `Пользователь: ${data.publickName}\n` +
    `username: @${data.userName}\n` +
    `Время: ${now.toLocaleString("ru-RU")}\n` +
    `Фото/видео: \n` +
    mediaURLs.join("\n");

  await db.Review.create({
    content: data.content,
    created_at: now,
    filial: data.filial,
    mark: data.mark,
    publickName: data.publickName,
    userName: data.userName,
    media: JSON.stringify(media.map((url) => `${ENV.strapi.host}${url.url}`)),
  }).save();

  // await trpc.messages.send.mutate({
  //   body: notifyContent,
  //   token: ENV.review.senderGroupToken,
  //   topic: "Отзывы",
  // });
};
