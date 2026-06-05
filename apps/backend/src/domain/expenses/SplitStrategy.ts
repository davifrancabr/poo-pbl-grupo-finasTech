import type { MemberId } from '../group/MemberId';
import { Money } from '../shared/Money';
import { SplitAllocation } from './SplitAllocation';

export abstract class SplitStrategy {
  abstract calculate(total: Money, participants: MemberId[]): SplitAllocation[];
}

export class EqualSplitStrategy extends SplitStrategy {
  calculate(total: Money, participants: MemberId[]): SplitAllocation[] {
    if (participants.length === 0)
      throw new Error('É obrigatório possuir ao menos 1 participante.');

    const perPerson = total.divide(participants.length);
    const allocations = participants.map(id =>
      SplitAllocation.create(id, perPerson)
    );

    const sum = allocations.reduce(
      (acc, a) => acc.add(a.getShare()),
      Money.zero(total.getCurrency())
    );

    const remainder = total.subtract(sum);

    if (!remainder.isZero() && allocations.length > 0) {
      const last = allocations.at(-1);
      allocations[allocations.length - 1] = SplitAllocation.create(
        last?.getMemberId()!,
        last?.getShare().add(remainder)!
      );
    }
    return allocations;
  }
}

export class FixedAmountSplitStrategy extends SplitStrategy {
  constructor(private readonly amounts: Map<string, Money>) {
    super();
  }

  calculate(total: Money, participants: MemberId[]): SplitAllocation[] {
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
      Money.zero(total.getCurrency())
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
    total: Money,
    participants: MemberId[]
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
      Money.zero(total.getCurrency())
    );

    const remainder = total.subtract(sum);
    if (!remainder.isZero() && allocations.length > 0) {
      const last = allocations.at(-1);
      allocations[allocations.length - 1] = SplitAllocation.create(
        last?.getMemberId()!,
        last?.getShare().add(remainder)!
      );
    }
    return allocations;
  }
}
