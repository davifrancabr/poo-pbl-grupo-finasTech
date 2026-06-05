import type { GroupId } from '../group/GroupId';
import type { MemberId } from '../group/MemberId';
import { DomainError } from '../shared/DomainError';
import { Money } from '../shared/Money';
import { GoalId } from './GoalId';

export interface GoalContribution {
  memberId: MemberId;
  amount: Money;
  contributedAt: Date;
}

export class SavingsGoal {
  private currentAmount: Money;

  private constructor(
    private readonly id: GoalId,
    private readonly groupId: GroupId,
    private readonly title: string,
    private readonly targetAmount: Money,
    currentAmount: Money,
    private readonly deadline: Date | null,
    private readonly contributions: GoalContribution[]
  ) {
    this.currentAmount = currentAmount;
  }

  static create(
    groupId: GroupId,
    title: string,
    targetAmount: Money,
    deadline?: Date
  ): SavingsGoal {
    if (!targetAmount.isPositive())
      throw new DomainError('Valor da meta deve ser positivo.');

    const trimmed = title.trim();
    if (trimmed.length < 2)
      throw new DomainError(
        'titulo da meta deve possuir ao menos 2 caracteres.'
      );

    return new SavingsGoal(
      GoalId.create(),
      groupId,
      trimmed,
      targetAmount,
      Money.zero(targetAmount.getCurrency()),
      deadline ?? null,
      []
    );
  }

  static reconstitute(
    id: GoalId,
    groupId: GroupId,
    title: string,
    targetAmount: Money,
    currentAmount: Money,
    deadline: Date | null,
    contributions: GoalContribution[]
  ): SavingsGoal {
    return new SavingsGoal(
      id,
      groupId,
      title,
      targetAmount,
      currentAmount,
      deadline,
      [...contributions]
    );
  }

  getId(): GoalId {
    return this.id;
  }

  getGroupId(): GroupId {
    return this.groupId;
  }

  getTitle(): string {
    return this.title;
  }

  getTargetAmount(): Money {
    return this.targetAmount;
  }

  getCurrentAmount(): Money {
    return this.currentAmount;
  }

  getDeadline(): Date | null {
    return this.deadline;
  }

  getContributions(): readonly GoalContribution[] {
    return [...this.contributions];
  }

  isAchieved(): boolean {
    return (
      this.currentAmount.isGreaterThan(this.targetAmount) ||
      this.currentAmount.equals(this.targetAmount)
    );
  }

  getProgressPercent(): number {
    if (this.targetAmount.isZero()) return 100;
    const current = Number(this.currentAmount.getAmount());
    const target = Number(this.targetAmount.getAmount());

    return Math.min(100, Math.round((current / target) * 100));
  }

  contribute(memberId: MemberId, amount: Money) {
    if (!amount.isPositive())
      throw new DomainError('Contribuição deve ser positivo');

    this.currentAmount = this.currentAmount.add(amount);
    this.contributions.push({ memberId, amount, contributedAt: new Date() });
  }
}
