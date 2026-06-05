import type { ExpenseRepository } from '@/application/ports/ExpenseRepository';
import type { Expense } from '@/domain/expenses/Expense';
import type { GroupId } from '@/domain/group/GroupId';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseMapper } from '../mappers/ExpenseMapper';
import { db } from './client';
import { expenses, expenseSplits, groups } from './schema';

export class DrizzleExpenseRepository implements ExpenseRepository {
  async save(expense: Expense): Promise<void> {
    const expenseId = expense.getId().getValue();
    const splitRows = expense.getSplits().map(s => ({
      id: uuidv4(),
      expenseId,
      memberId: s.getMemberId().getValue(),
      shareAmount: s.getShare().getAmount()
    }));

    await db.transaction(async tx => {
      await tx.insert(expenses).values({
        id: expenseId,
        groupId: expense.getGroupId().getValue(),
        payerId: expense.getPayerId().getValue(),
        totalAmount: expense.getTotalAmount().getAmount(),
        description: expense.getDescription(),
        occurredAt: expense.getOccurredAt()
      });

      if (splitRows.length > 0) {
        await tx.insert(expenseSplits).values(splitRows);
      }
    });
  }

  async findByGroupId(groupId: GroupId): Promise<Expense[]> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId.getValue()),
      columns: { currencyCode: true }
    });
    if (!group) return [];

    const rows = await db.query.expenses.findMany({
      where: eq(expenses.groupId, groupId.getValue()),
      with: { splits: true },
      orderBy: desc(expenses.occurredAt)
    });

    return rows.map(r => ExpenseMapper.toDomain(r, group.currencyCode));
  }
}
