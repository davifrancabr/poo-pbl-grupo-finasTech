import type { MembroId } from '../grupo/MembroId';
import type { Dinheiro } from '../shared/Dinheiro';

export class SplitAllocation {
  private constructor(
    private readonly membroId: MembroId,
    private readonly compartilhado: Dinheiro
  ) {}

  static create(memberId: MembroId, share: Dinheiro): SplitAllocation {
    if (!share.isPositive() && !share.isZero())
      throw new Error('Valor compartilhado não pode ser negativo.');

    return new SplitAllocation(memberId, share);
  }

  getMemberId(): MembroId {
    return this.membroId;
  }

  getShare(): Dinheiro {
    return this.compartilhado;
  }
}
