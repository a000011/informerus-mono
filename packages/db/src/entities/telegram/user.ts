import typeorm, {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { TelegramChatDB } from "./chat.js";

@Entity()
export class TelegramUserDB extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ unique: true, type: "bigint" })
  telegramId: number;

  @OneToOne(() => TelegramChatDB, (chat) => chat.user, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  chat?: typeorm.Relation<TelegramChatDB>;
}
