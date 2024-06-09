import { session, Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";

import { InformerContext } from "./context.js";
import { privateMessagesBot } from "./stage/stage.js";

const bot = new Telegraf(ENV.telegram.token, { contextType: InformerContext });

bot.catch((err) => console.error(err));
bot.use(session());
bot.use(privateMessagesBot);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
