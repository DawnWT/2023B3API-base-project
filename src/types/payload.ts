import { User } from '../users/entities/user.entity';

export type Payload = { id: string; role: typeof User.prototype.role };
