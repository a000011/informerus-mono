import { EventEmitter } from "node:events";
import { observable } from "@trpc/server/observable";

import type { IncomingMessageType } from "@informerus/validators";
import { IncomingMessageSchema } from "@informerus/validators";

import { publicProcedure } from "../trpc.js";

const messageEvents = new EventEmitter();

export const messages = {
  onNew: publicProcedure.subscription(() =>
    observable<IncomingMessageType>((emit) => {
      const onAdd = (data: IncomingMessageType) => {
        emit.next(data);
      };

      messageEvents.on("add", onAdd);
      return () => {
        messageEvents.off("add", onAdd);
      };
    }),
  ),

  send: publicProcedure.input(IncomingMessageSchema).mutation(({ input }) => {
    console.log(input);
    messageEvents.emit("add", input);
  }),
};
