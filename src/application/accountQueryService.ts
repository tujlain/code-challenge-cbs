import { InMemoryEventStore } from '../infrastructure/eventStore/inMemoryEventStore';
import { AccountAggregate } from '../features/account/accountAggregate';
import { AccountEvent } from '../features/account/accountEvents';

export class AccountQueryService {
  constructor(private store: InMemoryEventStore, private initialBalance: number = 1000) {}

  getBalance(accountId: string): number {
    const events: AccountEvent[] = this.store.getEventsForAccount(accountId);
    const aggregate = new AccountAggregate(this.initialBalance);
    return aggregate.rebuild(events);
  }
}
