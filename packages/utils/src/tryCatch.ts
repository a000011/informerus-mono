export const tryCatch = <T>(callback: () => T): [T, null] | [null, Error] => {
  try {
    return [callback(), null];
  } catch (err) {
    return [null, err as Error];
  }
};

export const tryCatchAsync = async <T>(
  callback: (() => Promise<T>) | Promise<T>,
): Promise<[T, null] | [null, Error]> => {
  try {
    return callback instanceof Promise
      ? [await callback, null]
      : [await callback(), null];
  } catch (err) {
    return [null, err as Error];
  }
};
