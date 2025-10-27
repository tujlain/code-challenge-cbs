import { AccountEvent } from '../../features/account/accountEvents';

export class InMemoryEventStore {
  private events: AccountEvent[] = [];

  append(event: AccountEvent) {
    this.events.push(event);
  }

  getEventsForAccount(accountId: string): AccountEvent[] {
    return this.events.filter(e => e.accountId === accountId);
  }

  getAllEvents(): AccountEvent[] {
    return [...this.events];
  }
}
