import { session, Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";

const bot = new Telegraf(ENV.telegram.token);

bot.catch((err) => console.error(err));
bot.use(session());
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
