import { InMemoryEventStore } from '../../infrastructure/eventStore/inMemoryEventStore';
import { WithdrawMoneyCommand } from './withdrawMoneyCommand';
import { AccountAggregate } from './accountAggregate';
import { AccountEvent, MoneyWithdrawnEvent, InsufficientFundsEvent, InvalidWithdrawalEvent } from './accountEvents';
import { now } from '../../shared/utils';

export class AccountService {
  constructor(private store: InMemoryEventStore, private initialBalance: number = 1000) {}

  withdraw(command: WithdrawMoneyCommand): AccountEvent {
    const { accountId, amount } = command;

    if (amount <= 0) {
      const invalidEvent: InvalidWithdrawalEvent = {
        type: 'InvalidWithdrawal',
        accountId,
        attemptedAmount: amount,
        reason: 'Amount must be positive',
        timestamp: now(),
      };
      this.store.append(invalidEvent);
      return invalidEvent;
    }

    const aggregate = new AccountAggregate(this.initialBalance);
    const currentBalance = aggregate.rebuild(this.store.getEventsForAccount(accountId));

    if (amount > currentBalance) {
      const insufficientEvent: InsufficientFundsEvent = {
        type: 'InsufficientFunds',
        accountId,
        attemptedAmount: amount,
        balance: currentBalance,
        timestamp: now(),
      };
      this.store.append(insufficientEvent);
      return insufficientEvent;
    }

    const withdrawnEvent: MoneyWithdrawnEvent = {
      type: 'MoneyWithdrawn',
      accountId,
      amount,
      balanceAfter: currentBalance - amount,
      timestamp: now(),
    };

    this.store.append(withdrawnEvent);
    return withdrawnEvent;
  }
}
