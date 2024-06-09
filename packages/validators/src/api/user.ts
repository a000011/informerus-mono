import { z } from "zod";

export const NewUserSchema = z.object({
  /**
   * Id пользователя
   */
  userId: z.number(),
});

export type NewUserType = z.infer<typeof NewUserSchema>;

// ---

export const SetUserMenuSchema = z.object({
  /**
   * Id пользователя
   */
  userId: z.number(),
  /**
   * Какое меню ему проставить
   */
  menu: z.string(),
});

export type SetUserMenuType = z.infer<typeof SetUserMenuSchema>;
