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

// Helper to create historical MoneyWithdrawnEvent
function createMoneyWithdrawnEvent(accountId: string, amount: number, balanceAfter: number): MoneyWithdrawnEvent {
  return {
    type: 'MoneyWithdrawn',
    accountId,
    amount,
    balanceAfter,
    timestamp: now(),
  };
}

describe('AccountService - Full Test Suite', () => {
  let store: InMemoryEventStore;
  let service: AccountService;

  beforeEach(() => {
    store = new InMemoryEventStore();
    service = new AccountService(store, 1000);
  });

  // 1️⃣ Basic functionality
  it('should withdraw money successfully', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-1', amount: 200 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('MoneyWithdrawn');
    expect((event as MoneyWithdrawnEvent).balanceAfter).toBe(800);
  });

  it('should fail withdrawal if insufficient funds', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-2', amount: 1200 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InsufficientFunds');
    expect((event as InsufficientFundsEvent).balance).toBe(1000);
  });

  it('should return invalid withdrawal for negative amount', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-3', amount: -50 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InvalidWithdrawal');
    expect((event as InvalidWithdrawalEvent).reason).toBe('Amount must be positive');
  });

  it('should return invalid withdrawal for zero amount', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-3', amount: 0 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InvalidWithdrawal');
    expect((event as InvalidWithdrawalEvent).reason).toBe('Amount must be positive');
  });

  // 2️⃣ Exact balance
  it('should allow withdrawing entire balance', () => {
    const command: WithdrawMoneyCommand = { accountId: 'acc-4', amount: 1000 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('MoneyWithdrawn');
    expect((event as MoneyWithdrawnEvent).balanceAfter).toBe(0);
  });

  // 3️⃣ Multiple / recurring withdrawals
  it('should compute balance correctly after multiple withdrawals', () => {
    const accountId = 'acc-5';

    store.append(createMoneyWithdrawnEvent(accountId, 100, 900));
    store.append(createMoneyWithdrawnEvent(accountId, 200, 700));

    const command: WithdrawMoneyCommand = { accountId, amount: 300 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('MoneyWithdrawn');
    expect((event as MoneyWithdrawnEvent).balanceAfter).toBe(400);
  });

  it('should handle multiple withdrawals leading to insufficient funds', () => {
    const accountId = 'acc-6';

    store.append(createMoneyWithdrawnEvent(accountId, 400, 600));
    store.append(createMoneyWithdrawnEvent(accountId, 300, 300));

    const command: WithdrawMoneyCommand = { accountId, amount: 500 };
    const event: AccountEvent = service.withdraw(command);

    expect(event.type).toBe('InsufficientFunds');
    expect((event as InsufficientFundsEvent).balance).toBe(300);
  });

  // 4️⃣ Event store integrity
  it('should store all emitted events', () => {
    const accountId = 'acc-7';
    const commands: WithdrawMoneyCommand[] = [
      { accountId, amount: 200 },
      { accountId, amount: 300 },
      { accountId, amount: 600 } // should fail
    ];

    const events: AccountEvent[] = commands.map(c => service.withdraw(c));

    expect(events[0].type).toBe('MoneyWithdrawn');
    expect(events[1].type).toBe('MoneyWithdrawn');
    expect(events[2].type).toBe('InsufficientFunds');

    const storeEvents = store.getEventsForAccount(accountId);
    expect(storeEvents).toHaveLength(3);
  });
});

describe('AccountService - Parameter validation', () => {
  let store: InMemoryEventStore;
  let service: AccountService;

  beforeEach(() => {
    store = new InMemoryEventStore();
    service = new AccountService(store);
  });

  it('should throw error if command is missing', () => {
    expect(() => service.withdraw(undefined as any)).toThrow('Command is required');
  });

  it('should throw error if accountId is missing', () => {
    const command: any = { amount: 100 };
    expect(() => service.withdraw(command)).toThrow('accountId is required and must be a string');
  });

  it('should throw error if amount is missing', () => {
    const command: any = { accountId: 'acc-1' };
    expect(() => service.withdraw(command)).toThrow('amount is required and must be a number');
  });

  it('should throw error if accountId is not a string', () => {
    const command: any = { accountId: 123, amount: 100 };
    expect(() => service.withdraw(command)).toThrow('accountId is required and must be a string');
  });

  it('should throw error if amount is not a number', () => {
    const command: any = { accountId: 'acc-1', amount: 'not-a-number' };
    expect(() => service.withdraw(command)).toThrow('amount is required and must be a number');
  });
});
