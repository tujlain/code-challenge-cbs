import { BaseEvent } from '../../shared/baseEvents';
import { Amount } from '../../shared/sharedTypes';

export interface MoneyWithdrawnEvent extends BaseEvent {
  type: 'MoneyWithdrawn';
  amount: Amount;
  balanceAfter: Amount;
}

export interface InsufficientFundsEvent extends BaseEvent {
  type: 'InsufficientFunds';
  attemptedAmount: Amount;
  balance: Amount;
}

export interface InvalidWithdrawalEvent extends BaseEvent {
  type: 'InvalidWithdrawal';
  attemptedAmount: Amount;
  reason: string;
}

export type AccountEvent = MoneyWithdrawnEvent | InsufficientFundsEvent | InvalidWithdrawalEvent;
