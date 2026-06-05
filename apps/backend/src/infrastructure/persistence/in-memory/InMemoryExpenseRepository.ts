import type { ExpenseRepository } from '@/application/ports/ExpenseRepository';
import type { Expense } from '@/domain/expenses/Expense';
import type { GroupId } from '@/domain/group/GroupId';

export class InMemoryExpenseRepository implements ExpenseRepository {
  private readonly store: Expense[] = [];

  async save(expense: Expense): Promise<void> {
    this.store.push(expense);
  }

  async findByGroupId(groupId: GroupId): Promise<Expense[]> {
    return this.store.filter(
      e => e.getGroupId().getValue() === groupId.getValue()
    );
  }
}
