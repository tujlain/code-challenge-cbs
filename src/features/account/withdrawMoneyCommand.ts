import { AccountId, Amount } from '../../shared/sharedTypes';

export interface WithdrawMoneyCommand {
  readonly accountId: AccountId;
  readonly amount: Amount;
}
