import { AccountService } from '../../../src/features/account/accountService';
import { InMemoryEventStore } from '../../../src/infrastructure/eventStore/inMemoryEventStore';
import { WithdrawMoneyCommand } from '../../../src/features/account/withdrawMoneyCommand';
import {
  AccountEvent,
  MoneyWithdrawnEvent,
  InsufficientFundsEvent,
  InvalidWithdrawalEvent
} from '../../../src/features/account/accountEvents';
import { now } from '../../../src/shared/utils';


// helper to create historical MoneyWithdrawnEvent
function createMoneyWithdrawnEvent(accountId: string, amount: number, balanceAfter: number): MoneyWithdrawnEvent {
  return {
    type: 'MoneyWithdrawn',
    accountId,
    amount,
    balanceAfter,
    timestamp: now(),
  };
}

describe('AccountService', () => {
  let store: InMemoryEventStore;
  let service: AccountService;

  beforeEach(() => {
    store = new InMemoryEventStore();
    service = new AccountService(store, 1000); // initial balance 1000
  });

  it('should withdraw money successfully', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-1', amount: 200 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('MoneyWithdrawn');
    expect((event as MoneyWithdrawnEvent).balanceAfter).toBe(800);

    const events = store.getEventsForAccount('acc-1');
    expect(events).toHaveLength(1);
    expect((events[0] as MoneyWithdrawnEvent).amount).toBe(200);
  });

  it('should return insufficient funds event', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-2', amount: 1200 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InsufficientFunds');
    expect((event as InsufficientFundsEvent).balance).toBe(1000);
    const events = store.getEventsForAccount('acc-2');
    expect(events).toHaveLength(1);
  });

  it('should return invalid withdrawal event for negative amount', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-3', amount: -50 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InvalidWithdrawal');
    expect((event as InvalidWithdrawalEvent).reason).toBe('Amount must be positive');
    const events = store.getEventsForAccount('acc-3');
    expect(events).toHaveLength(1);
  });

  it('should correctly compute balance after multiple withdrawals', () => {
    const accountId = 'acc-4';

    // historical withdrawals
    store.append(createMoneyWithdrawnEvent(accountId, 100, 900));
    store.append(createMoneyWithdrawnEvent(accountId, 200, 700));

    // new withdrawal
    const command: WithdrawMoneyCommand = { accountId, amount: 300 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('MoneyWithdrawn');
    expect((event as MoneyWithdrawnEvent).balanceAfter).toBe(400);

    const events = store.getEventsForAccount(accountId);
    expect(events).toHaveLength(3);
  });

  it('should correctly handle multiple withdrawals leading to insufficient funds', () => {
    const accountId = 'acc-5';

    // historical withdrawals
    store.append(createMoneyWithdrawnEvent(accountId, 400, 600));
    store.append(createMoneyWithdrawnEvent(accountId, 300, 300));

    // attempt to withdraw more than remaining balance
    const command: WithdrawMoneyCommand = { accountId, amount: 500 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InsufficientFunds');
    expect((event as InsufficientFundsEvent).balance).toBe(300);

    const events = store.getEventsForAccount(accountId);
    expect(events).toHaveLength(3);
  });
});
