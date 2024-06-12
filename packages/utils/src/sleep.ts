export const sleepMs = (timeMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, timeMs));
