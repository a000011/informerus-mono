import type { Scenes } from "telegraf";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";
import { Context } from "telegraf";

import type { AppRouter } from "@informerus/api";
import { ENV } from "@informerus/validators";

import { SCENES } from "./stage/stage.js";

export class InformerContext extends Context {
  // Обязательное поле, требуется для расширения контекста
  public scene: Scenes.SceneContextScene<InformerContext>;

  public trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `http://${ENV.api.host}:${ENV.api.port}/trpc`,
      }),
    ],
    transformer: SuperJSON,
  });

  public navigator = {
    goto: async (menu: keyof typeof SCENES) => {
      await this.scene.enter(SCENES[menu].id);
    },
  };
}
