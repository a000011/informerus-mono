import { Composer, Scenes } from "telegraf";

import { IntroductionMenu } from "./scenes/introduction.js";
import { RegistrationMenu } from "./scenes/registration.js";
import { RegistrationRetry } from "./scenes/registrationRetry.js";
import { WebhookMenu } from "./scenes/webhook.js";

export const SCENES = {
  Introduction: IntroductionMenu,
  Registration: RegistrationMenu,
  Webhook: WebhookMenu,
  RegistrationRetry: RegistrationRetry,
} as const;

const stage = new Scenes.Stage(Object.values(SCENES), {
  default: SCENES.Introduction.id,
});

stage.use(
  Composer.compose([
    async (ctx, next) => {
      if (!ctx.from?.id) {
        return;
      }

      await ctx.trpc.user.create.mutate({ userId: ctx.from.id });

      return await next();
    },
    Composer.command("start", (ctx) => ctx.navigator.goto("Introduction")),
    Composer.dispatch((ctx) => ctx.session.currentScene, SCENES),
    async (ctx) => {
      await ctx.reply("Я не понимаю эту команду");

      await ctx.navigator.goto(ctx.session.currentScene);
    },
    Composer.catch((err) => console.error(err)),
  ]),
);

export const privateMessagesModule = new Composer(stage.middleware());
