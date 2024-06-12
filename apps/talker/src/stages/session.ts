import type { Scenes } from "telegraf";

import type { SCENES } from "./private/stage/composer.js";

export interface InformerSession extends Scenes.SceneSession {
  currentScene: keyof typeof SCENES;
}

export const defaultSession = (): InformerSession => ({
  currentScene: "Introduction",
});
