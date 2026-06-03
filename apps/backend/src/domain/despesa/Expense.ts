import type { GrupoId } from '../grupo/GrupoId';
import type { MembroId } from '../grupo/MembroId';
import { Dinheiro } from '../shared/Dinheiro';
import { DomainError } from '../shared/DomainError';
import { ExpenseId } from './ExpenseId';
import type { SplitAllocation } from './SplitAllocation';

export class Expense {
  private constructor(
    private readonly id: ExpenseId,
    private readonly groupId: GrupoId,
    private readonly payerId: MembroId,
    private readonly totalAmount: Dinheiro,
    private readonly splits: readonly SplitAllocation[],
    private readonly description: string,
    private readonly occurredAt: Date
  ) {}

  static create(
    groupId: GrupoId,
    payerId: MembroId,
    totalAmount: Dinheiro,
    splits: SplitAllocation[],
    description: string
  ): Expense {
    if (!totalAmount.isPositive())
      throw new DomainError('Quantia da despesa deve ser positivo.');

    const sum = splits.reduce(
      (acc, s) => acc.add(s.getShare()),
      Dinheiro.zero(totalAmount.getMoeda())
    );

    if (!sum.equals(totalAmount))
      throw new DomainError(
        'Valor compartilhado não deve passar da quantia total.'
      );

    const trimmedDesc = description.trim() || 'Despesa';

    return new Expense(
      Expense.create(),
      groupId,
      payerId,
      totalAmount,
      Object.freeze([...splits]),
      trimmedDesc,
      new Date()
    );
  }

  static reconstitute(
    id: Expense,
    groupId: GrupoId,
    payerId: MembroId,
    totalAmount: Dinheiro,
    splits: SplitAllocation[],
    description: string,
    occurredAt: Date
  ): Expense {
    return new Expense(
      id,
      groupId,
      payerId,
      totalAmount,
      Object.freeze([...splits]),
      description,
      occurredAt
    );
  }

  getId(): Expense {
    return this.id;
  }

  getGroupId(): GrupoId {
    return this.groupId;
  }

  getPayerId(): MembroId {
    return this.payerId;
  }

  getTotalAmount(): Dinheiro {
    return this.totalAmount;
  }

  getSplits(): readonly SplitAllocation[] {
    return this.splits;
  }

  getDescription(): string {
    return this.description;
  }

  getOccurredAt(): Date {
    return this.occurredAt;
  }
}
