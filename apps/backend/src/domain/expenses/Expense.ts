import type { GroupId } from '../group/GroupId';
import type { MemberId } from '../group/MemberId';
import { DomainError } from '../shared/DomainError';
import { Money } from '../shared/Money';
import { ExpenseId } from './ExpenseId';
import type { SplitAllocation } from './SplitAllocation';

export class Expense {
  private constructor(
    private readonly id: ExpenseId,
    private readonly groupId: GroupId,
    private readonly payerId: MemberId,
    private readonly totalAmount: Money,
    private readonly splits: readonly SplitAllocation[],
    private readonly description: string,
    private readonly occurredAt: Date
  ) {}

  static create(
    groupId: GroupId,
    payerId: MemberId,
    totalAmount: Money,
    splits: SplitAllocation[],
    description: string
  ): Expense {
    if (!totalAmount.isPositive())
      throw new DomainError('Quantia da despesa deve ser positivo.');

    const sum = splits.reduce(
      (acc, s) => acc.add(s.getShare()),
      Money.zero(totalAmount.getCurrency())
    );

    if (!sum.equals(totalAmount))
      throw new DomainError(
        'Valor compartilhado não deve passar da quantia total.'
      );

    const trimmedDesc = description.trim() || 'Despesa';

    return new Expense(
      ExpenseId.create(),
      groupId,
      payerId,
      totalAmount,
      Object.freeze([...splits]),
      trimmedDesc,
      new Date()
    );
  }

  static reconstitute(
    id: ExpenseId,
    groupId: GroupId,
    payerId: MemberId,
    totalAmount: Money,
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

  getId(): ExpenseId {
    return this.id;
  }

  getGroupId(): GroupId {
    return this.groupId;
  }

  getPayerId(): MemberId {
    return this.payerId;
  }

  getTotalAmount(): Money {
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
