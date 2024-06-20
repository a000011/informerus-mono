import type { DataSourceOptions } from "typeorm";
import pg from "pg";
import { DataSource } from "typeorm";

import { tryCatchAsync } from "@informerus/utils";

import { TelegramChatDB } from "./entities/telegram/chat.js";
import { TelegramTopicDB } from "./entities/telegram/topic.js";
import { TelegramUserDB } from "./entities/telegram/user.js";

pg.types.setTypeParser(pg.types.builtins.INT8, function (val) {
  return Number(val);
});

const defaultDatabaseConfig = {
  type: "postgres",
  database: "informer",
  synchronize: true,
  logging: false,
  entities: [TelegramChatDB, TelegramTopicDB, TelegramUserDB],
  migrations: [],
  subscribers: [],
} satisfies Partial<DataSourceOptions>;

interface CreateDatabaseOptions {
  host: string;
  username: string;
  password: string;
  port: number;
}

export const createDatabaseConnection = async (
  options: CreateDatabaseOptions,
) => {
  const client = new pg.Client({ ...options, user: options.username });
  await client.connect();

  const [, err] = await tryCatchAsync(() =>
    client.query("CREATE DATABASE informer"),
  );

  if (err?.message.includes("already exists")) {
    console.log('База "informer" уже создана');
  } else if (err) {
    throw new Error("Ошибка при создании базы данных", { cause: err });
  }

  const sourceOptions = {
    ...options,
    ...defaultDatabaseConfig,
  };

  const AppDataSource = new DataSource(sourceOptions);
  await AppDataSource.initialize();

  return {
    Chats: TelegramChatDB,
    Topics: TelegramTopicDB,
    Users: TelegramUserDB,
  };
};
