import type { Telegraf } from "telegraf";
import { Composer, session } from "telegraf";

import type { InformerContext } from "./context.js";
import { groupMessagesModule } from "./groups/composer.js";
import { privateMessagesModule } from "./private/stage/composer.js";
import { defaultSession } from "./session.js";
import { superchatMessagesModule } from "./supergroups/composer.js";

export const setupChatsHandlers = (bot: Telegraf<InformerContext>) =>
  bot.use(
    Composer.compose([
      session({ defaultSession }),
      Composer.chatType(
        "private",
        Composer.on("message", privateMessagesModule),
      ),
      Composer.chatType("group", groupMessagesModule),
      Composer.chatType("supergroup", superchatMessagesModule),
    ]),
  );
