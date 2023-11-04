import { TypeORMError } from 'typeorm';

export abstract class BaseOptionException<
  T extends string | unknown,
> extends Error {
  constructor(public error?: Error) {
    super('');
    BaseOptionException.name;
  }

  abstract readonly type: T;
}

export class UnknownError extends BaseOptionException<'UnknownError'> {
  constructor(error: Error) {
    super(error);
  }

  type = 'UnknownError' as const;
}

export class DatabaseInternalError extends BaseOptionException<'DatabaseInternalError'> {
  constructor(error: TypeORMError) {
    super(error);
  }

  type = 'DatabaseInternalError' as const;
}

export type BaseError = DatabaseInternalError | UnknownError;
