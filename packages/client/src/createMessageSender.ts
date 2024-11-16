import got from "got";

import type { CreationOptions } from "./connectionOptions.js";

type SendMessageOptions = {
  /**
   * Topic
   *
   * Groups messages inside threads
   */
  topic: string;
  /**
   * Body of message
   */
  message: string;
};

export const createMessageSender =
  (connection: Required<CreationOptions>) =>
  async (body: SendMessageOptions) => {
    const url = `http://${connection.host}/topic/message`;

    const res = await got.post(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: connection.token,
      },
      body: JSON.stringify({
        topic: body.topic,
        body: body.message,
      }),
      throwHttpErrors: false,
    });

    return res.ok;
  };
