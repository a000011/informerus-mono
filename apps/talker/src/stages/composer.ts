import type { Telegraf } from "telegraf";
import { Composer, session } from "telegraf";

import type { InformerContext } from "./context.js";
import { privateMessagesModule } from "./private/stage/composer.js";
import { defaultSession } from "./session.js";
import { superchatMessagesModule } from "./supergroups/composer.js";

export const setupChatsHandlers = (bot: Telegraf<InformerContext>) =>
  bot.use(
    Composer.compose([
      session({ defaultSession }),
      Composer.chatType("private", privateMessagesModule),
      Composer.chatType("supergroup", superchatMessagesModule),
    ]),
  );
