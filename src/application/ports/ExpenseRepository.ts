import type { Expense } from '@/domain/expenses/Expense';
import type { GroupId } from '@/domain/group/GroupId';

export interface ExpenseRepository {
  save(expense: Expense): Promise<void>;
  findByGroupId(groupId: GroupId): Promise<Expense[]>;
}
