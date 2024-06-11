import type { Scenes } from "telegraf";
import { Context } from "telegraf";

import { createInformerClient } from "@informerus/client";

import { SCENES } from "./stage/stage.js";

export class InformerContext extends Context {
  // Обязательное поле, требуется для расширения контекста
  public scene: Scenes.SceneContextScene<InformerContext>;

  public trpc = createInformerClient();

  public navigator = {
    goto: async (menu: keyof typeof SCENES) => {
      await this.scene.enter(SCENES[menu].id);
    },
  };
}
