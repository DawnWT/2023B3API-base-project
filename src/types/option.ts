interface Ok<T> {
  content: T;
}

interface Err {
  error: string;
}

export type Option<T> = Ok<T> | Err;
