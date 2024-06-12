import type { Scenes } from "telegraf";

import type { InformerContext } from "../../context.js";

export const createButtonHelper = (
  scene: Scenes.BaseScene<InformerContext>,
) => {
  type Middleware = Parameters<typeof scene.hears>[1];
  return (text: string, callback: Middleware) => {
    scene.hears(text, callback);

    return text;
  };
};
