export type CachePropertyDescriptor<T, R> = {
  get?: (this: T) => R;
} & PropertyDescriptor;

export const singleton = <T, R>(
  _: object,
  name: PropertyKey,
  descriptor: CachePropertyDescriptor<T, R>,
) => {
  const getter = descriptor.get;

  if (!getter) throw new TypeError("Getter property descriptor expected");

  descriptor.get = function (this: T) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = getter.call(this);

    Object.defineProperty(this, name, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  };
};
