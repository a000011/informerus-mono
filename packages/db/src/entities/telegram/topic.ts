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
}
