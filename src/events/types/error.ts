import { QueryFailedError } from 'typeorm';
import { BaseOptionException } from '../../types/error';

export class EventNotFoundException extends BaseOptionException<'EventNotFoundException'> {
  constructor(error?: QueryFailedError) {
    super(error);
  }

  type = 'EventNotFoundException' as const;
}
