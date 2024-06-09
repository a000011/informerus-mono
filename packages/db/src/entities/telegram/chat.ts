import typeorm, {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { TelegramTopicDB } from "./topic.js";
import { TelegramUserDB } from "./user.js";

@Entity()
export class TelegramChatDB extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  telegramId: number;

  @OneToOne(() => TelegramUserDB, (user) => user.chat)
  user: typeorm.Relation<TelegramUserDB>;

  @OneToMany(() => TelegramTopicDB, (topic) => topic.chat, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  topics: typeorm.Relation<TelegramTopicDB>[];
}
