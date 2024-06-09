import { Composer, Scenes } from "telegraf";

import type { InformerContext } from "../context.js";
import { IntroductionMenu } from "./scenes/introduction.js";
import { RegistrationMenu } from "./scenes/registration.js";
import { RegistrationRetry } from "./scenes/registrationRetry.js";
import { WebhookMenu } from "./scenes/webhook.js";

export const privateMessagesBot = new Composer<InformerContext>();

export const SCENES = {
  Introduction: IntroductionMenu,
  Registration: RegistrationMenu,
  Webhook: WebhookMenu,
  RegistrationRetry: RegistrationRetry,
} as const;

const DEFAULT_SCENE = SCENES.Introduction.id;

const stage = new Scenes.Stage<InformerContext>(Object.values(SCENES), {
  default: DEFAULT_SCENE,
});

stage.use(
  Composer.compose([
    Composer.catch((err) => console.error(err)),
    async (ctx, next) => {
      if (!ctx.from?.id) {
        return;
      }

      await ctx.trpc.user.create.mutate({ userId: ctx.from.id });

      return next();
    },
  ]),
);

privateMessagesBot.use(stage.middleware());
privateMessagesBot.start((ctx) => ctx.navigator.goto("Introduction"));
