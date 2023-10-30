interface OptionBase<T> {
  isOk(): this is Ok<T>;
  isErr(): this is Err;
}

interface Ok<T> {
  content: T;
}

interface Err {
  error: string;
}

export type Option<T> = OptionBase<T> & (Ok<T> | Err);

export const Ok = function <T>(content: T): Option<T> {
  return {
    content,
    isOk() {
      return true;
    },
    isErr() {
      return false;
    },
  };
};

export const Err = function <T>(error: string): Option<T> {
  return {
    error,
    isOk() {
      return false;
    },
    isErr() {
      return true;
    },
  };
};
