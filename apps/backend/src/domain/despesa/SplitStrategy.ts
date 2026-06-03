import type { MembroId } from '../grupo/MembroId';
import { Dinheiro } from '../shared/Dinheiro';
import { SplitAllocation } from './SplitAllocation';

export abstract class SplitStrategy {
  abstract calculate(
    total: Dinheiro,
    participants: MembroId[]
  ): SplitAllocation[];
}

export class EqualSplitStrategy extends SplitStrategy {
  calculate(total: Dinheiro, participants: MembroId[]): SplitAllocation[] {
    if (participants.length === 0)
      throw new Error('É obrigatório possuir ao menos 1 participante.');

    const perPerson = total.divide(participants.length);
    const allocations = participants.map(id =>
      SplitAllocation.create(id, perPerson)
    );

    const sum = allocations.reduce(
      (acc, a) => acc.add(a.getShare()),
      Dinheiro.zero(total.getMoeda())
    );

    const remainder = total.subtract(sum);

    if (!remainder.isZero() && allocations.length > 0) {
      const last = allocations[allocations.length - 1];
      allocations[allocations.length - 1] = SplitAllocation.create(
        last?.getMemberId()!,
        last?.getShare().add(remainder)!
      );
    }
    return allocations;
  }
}

export class FixedAmountSplitStrategy extends SplitStrategy {
  constructor(private readonly amounts: Map<string, Dinheiro>) {
    super();
  }

  calculate(total: Dinheiro, participants: MembroId[]): SplitAllocation[] {
    const allocations = participants.map(id => {
      const amount = this.amounts.get(id.getValue());
      if (!amount)
        throw new Error(
          `Nenhuma quantia fixada para o membro ${id.getValue()}`
        );

      return SplitAllocation.create(id, amount);
    });

    const sum = allocations.reduce(
      (acc, a) => acc.add(a.getShare()),
      Dinheiro.zero(total.getMoeda())
    );

    if (!sum.equals(total))
      throw new Error('Quantia fixa deve ser somada com o total.');

    return allocations;
  }
}

export class PercentageSplitStrategy extends SplitStrategy {
  constructor(private readonly percentages: Map<string, number>) {
    super();
  }

  override calculate(
    total: Dinheiro,
    participants: MembroId[]
  ): SplitAllocation[] {
    const totalPercent = [...this.percentages.values()].reduce(
      (a, b) => a + b,
      0
    );
    if (Math.abs(totalPercent - 100) > 0.01)
      throw new Error('Porcentagem deve ser somada até 100');

    const allocations = participants.map(id => {
      const percent = this.percentages.get(id.getValue()) ?? 0;
      const share = total.multiply(percent / 100);

      return SplitAllocation.create(id, share);
    });

    const sum = allocations.reduce(
      (acc, a) => acc.add(a.getShare()),
      Dinheiro.zero(total.getMoeda())
    );

    const remainder = total.subtract(sum);
    if (!remainder.isZero() && allocations.length > 0) {
      const last = allocations[allocations.length - 1];
      allocations[allocations.length - 1] = SplitAllocation.create(
        last?.getMemberId()!,
        last?.getShare().add(remainder)!
      );
    }
    return allocations;
  }
}
