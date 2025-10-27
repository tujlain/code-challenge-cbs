import { AccountId, Timestamp } from './sharedTypes';

export interface BaseEvent {
  readonly type: string;
  readonly accountId: AccountId;
  readonly timestamp: Timestamp;
}
