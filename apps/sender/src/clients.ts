import { Telegraf } from "telegraf";

import { createInformerClient } from "@informerus/client";
import { ENV } from "@informerus/validators";

// Note: Do not use "launch" method.
// "launch" start the update receiver,
// if paired with "talker" will cause an "409 Error: multiple instances trying to receive update"
// https://telegrambots.github.io/book/FAQ.html#i-got-a-409-error-what-do-i-do
export const bot = new Telegraf(ENV.sender.token);
export const trpc = createInformerClient(ENV.sender.apiHost);
export const botInfo = await bot.telegram.getMe();
