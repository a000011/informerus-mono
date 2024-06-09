import type { Scenes } from "telegraf";
import { Markup } from "telegraf";

import type { InformerContext } from "../context.js";

export const createButtonHelper = (
  scene: Scenes.BaseScene<InformerContext>,
) => {
  type Middleware = Parameters<typeof scene.action>[1];
  return (text: string, callback: Middleware) => {
    scene.action(text.toLowerCase(), callback);

    return Markup.button.callback(text, text.toLowerCase());
  };
};
