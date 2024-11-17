import type { Scenes } from "telegraf";

import type { RouterOutputs } from "@informerus/api";

import type { SCENES } from "./private/stage/composer.js";

export type InformerSession = {
  currentScene: keyof typeof SCENES;
  user: RouterOutputs["user"]["findById"] | null;
} & Scenes.SceneSession;

export const defaultSession = (): InformerSession => ({
  currentScene: "Introduction",
  user: null,
});
