export const tryCatch = <T>(callback: () => T): [T, null] | [null, Error] => {
  try {
    return [callback(), null];
  } catch (err) {
    return [null, err as Error];
  }
};

export const tryCatchAsync = async <T>(
  callback: () => Promise<T>,
): Promise<[T, null] | [null, Error]> => {
  try {
    return [await callback(), null] as const;
  } catch (err) {
    return [null, err as Error] as const;
  }
};
