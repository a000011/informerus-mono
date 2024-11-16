import type { Scenes } from "telegraf";
import { Context } from "telegraf";

import { createInformerClient } from "@informerus/trpc-client";
import { ENV } from "@informerus/validators";

import type { InformerSession } from "./session.js";
import { SCENES } from "./private/stage/composer.js";

export class InformerContext extends Context {
  public session: InformerSession;

  // Обязательное поле, требуется для расширения контекста
  public scene: Scenes.SceneContextScene<InformerContext>;

  public trpc = createInformerClient(ENV.talker.apiHost);

  public navigator = {
    goto: async (menu: keyof typeof SCENES) => {
      this.session.currentScene = menu;
      await this.scene.enter(SCENES[menu].id);
    },
  };
}
