import { InMemoryEventStore } from '../../infrastructure/eventStore/inMemoryEventStore';
import { WithdrawMoneyCommand } from './withdrawMoneyCommand';
import { AccountAggregate } from './accountAggregate';
import {
  AccountEvent,
  MoneyWithdrawnEvent,
  InsufficientFundsEvent,
  InvalidWithdrawalEvent
} from './accountEvents';
import { now } from '../../shared/utils';

export class AccountService {
  constructor(
    private store: InMemoryEventStore,
    private defaultInitialBalance: number = 1000
  ) {}

  withdraw(command: WithdrawMoneyCommand): AccountEvent {
    this.validateCommand(command);

    const { accountId, amount } = command;
    const currentBalance = this.getCurrentBalance(accountId);

    if (amount <= 0) return this.createInvalidWithdrawalEvent(accountId, amount);
    if (amount > currentBalance) return this.createInsufficientFundsEvent(accountId, amount, currentBalance);

    return this.createMoneyWithdrawnEvent(accountId, amount, currentBalance);
  }

  // ---------------------------
  // Private helper methods
  // ---------------------------

  private validateCommand(command?: WithdrawMoneyCommand) {
    if (!command) throw new Error('Command is required');
    const { accountId, amount } = command;
    if (!accountId || typeof accountId !== 'string')
      throw new Error('accountId is required and must be a string');
    if (amount === undefined || typeof amount !== 'number')
      throw new Error('amount is required and must be a number');
  }

  private getCurrentBalance(accountId: string): number {
    const aggregate = new AccountAggregate(this.defaultInitialBalance);
    const events = this.store.getEventsForAccount(accountId);
    return aggregate.rebuild(events);
  }

  private createInvalidWithdrawalEvent(accountId: string, amount: number): InvalidWithdrawalEvent {
    const event: InvalidWithdrawalEvent = {
      type: 'InvalidWithdrawal',
      accountId,
      attemptedAmount: amount,
      reason: 'Amount must be positive',
      timestamp: now(),
    };
    this.store.append(event);
    return event;
  }

  private createInsufficientFundsEvent(accountId: string, amount: number, balance: number): InsufficientFundsEvent {
    const event: InsufficientFundsEvent = {
      type: 'InsufficientFunds',
      accountId,
      attemptedAmount: amount,
      balance,
      timestamp: now(),
    };
    this.store.append(event);
    return event;
  }

  private createMoneyWithdrawnEvent(accountId: string, amount: number, balance: number): MoneyWithdrawnEvent {
    const event: MoneyWithdrawnEvent = {
      type: 'MoneyWithdrawn',
      accountId,
      amount,
      balanceAfter: balance - amount,
      timestamp: now(),
    };
    this.store.append(event);
    return event;
  }
}
