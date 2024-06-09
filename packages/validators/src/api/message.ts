import { z } from "zod";

export const IncomingMessageSchema = z.object({
  /**
   * Топик, в который необходимо запихнуть сообщение
   */
  topic: z.string().trim().min(1),
  /**
   * Тело сообщения
   */
  body: z.string().trim().min(1),
});

export type IncomingMessageType = z.infer<typeof IncomingMessageSchema>;
