import type { IncomingMessageType } from "@informerus/validators";

import { trpc } from "./clients.js";
import { Queue } from "./queue.js";
import { TopicMessage } from "./topicMessage.js";

void new Queue<IncomingMessageType>()
  .setItemsPerMinute(19)
  .addDataSource((emit) => {
    trpc.messages.onNew.subscribe(undefined, { onData: emit });
  })
  .onNext(async (data) => {
    const messageHandler = new TopicMessage(data);
    await messageHandler.send();
  })
  .onError(console.error)
  .start();
