import typeorm, {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { TelegramChatDB } from "./chat.js";

@Entity()
export class TelegramTopicDB extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: "bigint" })
  telegramId: number;

  @Column()
  name: string;

  @ManyToOne(() => TelegramChatDB, (user) => user.topics)
  chat: typeorm.Relation<TelegramChatDB>;

  private static idsQueue = new Map<number, Promise<TelegramTopicDB>>();
  public static async createIfNotExists(
    options: Pick<TelegramTopicDB, "telegramId" | "name">,
  ): Promise<TelegramTopicDB> {
    const alreadyExistingTopic = await this.findByTelegramId(
      options.telegramId,
    );

    if (alreadyExistingTopic) {
      await alreadyExistingTopic.save();
      return alreadyExistingTopic;
    }

    const topic = TelegramTopicDB.create({ ...options });

    const existingTopic = TelegramTopicDB.idsQueue.get(options.telegramId);
    if (existingTopic) {
      return await existingTopic;
    }
    const pendingTopicSave = topic.save();
    TelegramTopicDB.idsQueue.set(options.telegramId, pendingTopicSave);

    return await pendingTopicSave;
  }

  public static async findByTelegramId(
    telegramId: number,
  ): Promise<TelegramTopicDB | undefined> {
    const topic = await TelegramTopicDB.findOneBy({ telegramId });

    if (!topic) {
      return undefined;
    }

    return topic;
  }
}
