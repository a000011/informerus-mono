import { Telegraf } from "telegraf";

import { ENV } from "@informerus/validators";

import { setupChatsHandlers } from "./stages/composer.js";
import { InformerContext } from "./stages/context.js";

const bot = new Telegraf(ENV.talker.token, { contextType: InformerContext });

bot.catch((err) => console.error(err));

setupChatsHandlers(bot);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

void bot.launch();
