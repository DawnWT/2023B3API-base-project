import { QueryFailedError } from 'typeorm';
import { BaseOptionException } from '../../types/error';

export class EventNotFoundException extends BaseOptionException<'EventNotFoundException'> {
  constructor(error?: QueryFailedError) {
    super(error);
  }

  type = 'EventNotFoundException' as const;
}

export class CantUpdateEventException extends BaseOptionException<'CantUpdateEventException'> {
  constructor(error?: QueryFailedError) {
    super(error);
  }

  type = 'CantUpdateEventException' as const;
}
