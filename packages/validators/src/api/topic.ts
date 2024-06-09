import { z } from "zod";

export const NewTopicSchema = z.object({
  /**
   * Имя топика
   */
  name: z.string(),
  /**
   * Id топика
   */
  id: z.number(),
  /**
   * Id чата, в котором был создан топик
   */
  chatId: z.number(),
});

export type NewTopicType = z.infer<typeof NewTopicSchema>;
