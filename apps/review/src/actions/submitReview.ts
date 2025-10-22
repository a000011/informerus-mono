import { ENV } from "@informerus/validators";
import { fetchDocumentMedia, uploadReview } from "../strapi/index.js";
import { trpc, type FilesType } from "../index.js";

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
  const now = new Date();

  const notifyContent =
    `Филиал: ${data.filial} \n` +
    `Оценка: ${data.mark}/5\n` +
    `Комментарий: ${data.content}\n` +
    `Пользователь: ${data.publickName}\n` +
    `username: @${data.userName}\n` +
    `Время: ${now.toLocaleString("ru-RU")}\n` +
    `Фото/видео: \n` +
    media.join("\n");

  await trpc.messages.send.mutate({
    body: notifyContent,
    token: ENV.review.senderGroupToken,
    topic: "testTopic",
  });
};
