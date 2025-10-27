import { AccountEvent, MoneyWithdrawnEvent } from './accountEvents';

export class AccountAggregate {
  private balance: number;

  constructor(private initialBalance: number = 1000) {
    this.balance = initialBalance;
  }

  rebuild(events: AccountEvent[]): number {
    this.balance = this.initialBalance;
    for (const event of events) {
      if (event.type === 'MoneyWithdrawn') {
        this.balance -= event.amount;
      }
    }
    return this.balance;
  }

  getBalance(): number {
    return this.balance;
  }
}
