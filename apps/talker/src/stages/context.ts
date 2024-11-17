import type { Scenes } from "telegraf";
import { Context } from "telegraf";

import { createInformerClient } from "@informerus/trpc-client";
import { ENV } from "@informerus/validators";

import type { InformerSession } from "./session.js";
import { SCENES } from "./private/stage/composer.js";

const trpc = createInformerClient(ENV.api.connectionUrl);

export class InformerContext extends Context {
  public session: InformerSession;

  // Обязательное поле, требуется для расширения контекста
  public scene: Scenes.SceneContextScene<InformerContext>;

  public trpc = trpc;

  public async revalidateCache(): Promise<void> {
    console.log("USER FETCHED");

    if (!this.from) {
      throw new Error("Message is not from User");
    }

    this.session.user = await this.trpc.user.findById.query(this.from.id);
  }

  public navigator = {
    goto: async (menu: keyof typeof SCENES) => {
      this.session.currentScene = menu;
      await this.scene.enter(SCENES[menu].id);
    },
  };
}
