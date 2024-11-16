import type { Scenes } from "telegraf";

import type { SCENES } from "./private/stage/composer.js";

export type InformerSession = {
  currentScene: keyof typeof SCENES;
} & Scenes.SceneSession;

export const defaultSession = (): InformerSession => ({
  currentScene: "Introduction",
});
