import type { DataSourceOptions } from "typeorm";
import pg from "pg";
import { DataSource } from "typeorm";

import { tryCatchAsync } from "@informerus/utils";
import { ReviewtDB } from "./entities/review.js";

pg.types.setTypeParser(pg.types.builtins.INT8, function (val) {
  return Number(val);
});

const defaultDatabaseConfig = {
  type: "postgres",
  database: "grafana",
  synchronize: true,
  logging: false,
  entities: [ReviewtDB],
  migrations: [],
  subscribers: [],
} satisfies Partial<DataSourceOptions>;

type CreateDatabaseOptions = {
  host: string;
  username: string;
  password: string;
  port: number;
};

export const createDatabaseConnection = async (
  options: CreateDatabaseOptions,
) => {
  const client = new pg.Client({ ...options, user: options.username });
  await client.connect();

  const [, err] = await tryCatchAsync(() =>
    client.query("CREATE DATABASE grafana"),
  );

  if (err?.message.includes("already exists")) {
    console.log('База "grafana" уже создана');
  } else if (err) {
    throw new Error("Ошибка при создании базы данных", { cause: err });
  }

  const sourceOptions = {
    ...options,
    ...defaultDatabaseConfig,
  };

  const AppDataSource = new DataSource(sourceOptions);
  await AppDataSource.initialize();

  return { Review: ReviewtDB };
};
