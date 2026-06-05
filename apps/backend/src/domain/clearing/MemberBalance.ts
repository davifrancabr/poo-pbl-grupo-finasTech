import type { MemberId } from '../group/MemberId';
import type { Money } from '../shared/Money';

export class MemberBalance {
  constructor(
    private readonly memberId: MemberId,
    private readonly balance: Money
  ) {}

  getMemberId(): MemberId {
    return this.memberId;
  }

  getBalance(): Money {
    return this.balance;
  }

  isCreditor(): boolean {
    return this.balance.isPositive();
  }

  isDebtor(): boolean {
    return this.balance.isNegative();
  }
}
