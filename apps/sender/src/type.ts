import type { IncomingMessageType } from "@informerus/validators";

export type IncomingMessageExtenedType = IncomingMessageType & {
  /**
   * В какой чат нам нужно отправить сообщение
   */
  chatId: number;
  /**
   * В какой топик нам нужно отправить сообщение (telegramId)
   */
  topicId: number;
};
