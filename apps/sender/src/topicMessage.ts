/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { TelegramError } from "telegraf";

import type { IncomingMessageType } from "@informerus/validators";
import { singleton, tryCatchAsync } from "@informerus/utils";

import { bot, botInfo, trpc } from "./clients.js";

const MAX_MESSAGE_LENGTH = 4096 - 200;

export class TopicMessage {
  public constructor(private message: IncomingMessageType) {}

  @singleton
  private get user() {
    return new Promise<{
      telegramId: number;
      token: string;
      chatId: number;
    }>(async (resolve, reject) => {
      const user = await trpc.user.findByToken.query(this.message.token);
      if (!user.chatId) {
        return reject("No user chat found!");
      }
      return resolve(
        user as { telegramId: number; token: string; chatId: number },
      );
    });
  }

  private get topics() {
    return this.user.then((u) =>
      trpc.chats.getAllTopics.query({ chatId: u.chatId }),
    );
  }

  private get selectedTopic() {
    return this.topics.then((topics) =>
      topics.find((t) => t.name === this.message.topic),
    );
  }

  private async createTopicInTelegram() {
    const user = await this.user;

    const newTopic = await bot.telegram.createForumTopic(
      user.chatId,
      this.message.topic,
    );
    return await trpc.chats.createTopic.mutate({
      chatId: user.chatId,
      id: newTopic.message_thread_id,
      name: newTopic.name,
    });
  }

  private async checkTopicInDb() {
    const selectedTopic = await this.selectedTopic;

    if (!selectedTopic) {
      await this.createTopicInTelegram();
    }
  }

  private async getTopicsRightsStatus() {
    const user = await this.user;
    const admins = await bot.telegram.getChatAdministrators(user.chatId);

    const me = admins.find((admin) => admin.user.username === botInfo.username);

    if (!me) {
      return "am_not_an_admin";
    }

    if (!("can_manage_topics" in me)) {
      return "unknown_error";
    }

    if (me.can_manage_topics === false) {
      return "cant_manage_topics";
    }

    return "ok";
  }

  private async sendMessage() {
    const user = await this.user;
    const selectedTopic = (await this.selectedTopic)!;

    await bot.telegram.sendMessage(user.chatId, this.messageShortened, {
      message_thread_id: selectedTopic.telegramId,
    });
  }

  private getErrorType(err: TelegramError) {
    if (err.response.description.includes("the chat is not a forum")) {
      return "chat_is_not_a_forum";
    }

    if (err.response.description.includes("TOPIC_ID_INVALID")) {
      return "topic_no_longer_exists";
    }

    return "unknown_error";
  }

  private async sendMessageInGeneral(body = this.messageShortened) {
    const user = await this.user;

    await bot.telegram.sendMessage(user.chatId, body);
  }

  private get messageShortened() {
    if (this.message.body.length > MAX_MESSAGE_LENGTH) {
      const postfix = "...";
      return (
        this.message.body.slice(0, MAX_MESSAGE_LENGTH - postfix.length) +
        postfix
      );
    }

    return this.message.body;
  }

  public async send(): Promise<void> {
    const topicsRightsStatus = await this.getTopicsRightsStatus();

    switch (topicsRightsStatus) {
      case "am_not_an_admin":
        await this.sendMessageInGeneral("Дай админку!");
        return;
      case "cant_manage_topics":
        await this.sendMessageInGeneral(
          "Дай права на администрирование топиков!",
        );
        return;

      case "unknown_error":
      case "ok":
        break;
    }

    const [_, err] = await tryCatchAsync(async () => {
      await this.checkTopicInDb();
      await this.sendMessage();
    });

    if (!err) {
      return;
    }

    console.warn("Ошибка при отправке сообщения:" + `${err.name}`);

    if (!(err instanceof TelegramError)) {
      throw err;
    }

    const errorType = this.getErrorType(err);

    switch (errorType) {
      case "unknown_error":
        throw err;
      case "chat_is_not_a_forum":
        await this.sendMessageInGeneral(
          `[${this.message.topic}]\n\n${this.messageShortened}\n\nВключи топики!`,
        );
        break;
      case "topic_no_longer_exists":
        await this.createTopicInTelegram();
        await this.sendMessage().catch(() => this.sendMessageInGeneral());
        break;
    }
  }
}
