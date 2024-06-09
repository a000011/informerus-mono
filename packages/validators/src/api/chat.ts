import { z } from "zod";

export const NewChatSchema = z.object({
  /**
   * Id чата
   */
  chatId: z.number(),
  /**
   * Имя чата
   */
  name: z.string(),
  /**
   * Какой пользователь пригласил бота в чат
   */
  triggeredById: z.number(),
});

export type NewChatType = z.infer<typeof NewChatSchema>;
