import { QueryFailedError } from 'typeorm';
import { BaseOptionException } from '../../types/error';

export class UserNotFoundException extends BaseOptionException<'UserNotFoundException'> {
  constructor(error?: QueryFailedError) {
    super(error);
  }

  type = 'UserNotFoundException' as const;
}

export class UserAlreadyExistException extends BaseOptionException<'UserAlreadyExistException'> {
  constructor(error?: QueryFailedError) {
    super(error);
  }

  type = 'UserAlreadyExistException' as const;
}

export class WrongPasswordException extends BaseOptionException<'WrongPasswordException'> {
  constructor() {
    super(null);
  }

  type = 'WrongPasswordException' as const;
}

export class UserNotAvailableException extends BaseOptionException<'UserNotAvailableException'> {
  constructor() {
    super(null);
  }

  type = 'UserNotAvailableException' as const;
}
