import type { CreationOptions } from "./connectionOptions.js";
import { createMessageSender } from "./createMessageSender.js";

/**
 * Creates an client to
 * @param options Options to create a connection
 */
export const createInformerApi = (options: CreationOptions) => ({
  sendMessage: createMessageSender({ host: "stercus.ru:3000", ...options }),
});
