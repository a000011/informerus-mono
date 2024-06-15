import { sleepMs, tryCatchAsync } from "@informerus/utils";

export class Queue<T extends Record<string, unknown>> {
  private QUEUE_NEXT_ITEM_DELAY_MS: number;

  constructor() {
    this.setItemsPerMinute(19);
  }

  public setItemsPerMinute(msgCount: number): this {
    this.QUEUE_NEXT_ITEM_DELAY_MS = (1000 * 60) / msgCount;
    return this;
  }

  private stack: T[] = [];

  private _sources: ((emit: (data: T) => void) => void)[] = [];
  addDataSource(callback: (emit: (data: T) => void) => void): this {
    this._sources.push(callback);
    return this;
  }

  private _callbacks: ((data: T) => Promise<void>)[] = [];
  public onNext(callback: (data: T) => Promise<void>): this {
    this._callbacks.unshift(callback);
    return this;
  }

  private _errorHandlers: ((error: Error) => void)[] = [];
  public onError(callback: (error: Error) => void): this {
    this._errorHandlers.unshift(callback);
    return this;
  }

  async start() {
    for (const source of this._sources) {
      void source((entry) => this.stack.push(entry));
    }

    while (true) {
      const message = this.stack.shift();

      if (!message) {
        await sleepMs(this.QUEUE_NEXT_ITEM_DELAY_MS);
        continue;
      }

      for (const callback of this._callbacks) {
        const [_, err] = await tryCatchAsync(() => callback(message));

        if (err) {
          for (const errorHandler of this._errorHandlers) {
            errorHandler(err);
          }
        }
      }
      await sleepMs(this.QUEUE_NEXT_ITEM_DELAY_MS);
    }
  }
}
