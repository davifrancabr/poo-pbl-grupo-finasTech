import type { MemberId } from '../group/MemberId';
import type { Money } from '../shared/Money';

export class Settlement {
  constructor(
    private readonly fromMemberId: MemberId,
    private readonly toMemberId: MemberId,
    private readonly amount: Money
  ) {}

  getFromMemberId(): MemberId {
    return this.fromMemberId;
  }

  getToMemberId(): MemberId {
    return this.toMemberId;
  }

  getAmount(): Money {
    return this.amount;
  }
}
