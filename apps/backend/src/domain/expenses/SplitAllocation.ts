import type { MemberId } from '../group/MemberId';
import type { Money } from '../shared/Money';

export class SplitAllocation {
  private constructor(
    private readonly memberId: MemberId,
    private readonly share: Money
  ) {}

  static create(memberId: MemberId, share: Money): SplitAllocation {
    if (!share.isPositive() && !share.isZero())
      throw new Error('Valor compartilhado não pode ser negativo.');

    return new SplitAllocation(memberId, share);
  }

  getMemberId(): MemberId {
    return this.memberId;
  }

  getShare(): Money {
    return this.share;
  }
}
