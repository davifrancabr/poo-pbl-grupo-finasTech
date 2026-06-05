import type { MemberBalance } from '@/domain/clearing/MemberBalance';
import type { Settlement } from '@/domain/clearing/Settlement';
import type { Expense } from '@/domain/expenses/Expense';
import type { Group } from '@/domain/group/Group';
import type { SavingsGoal } from '@/domain/savings/SavingsGoal';

export function serializeGroup(group: Group) {
  return {
    id: group.getId().getValue(),
    name: group.getName(),
    currency: group.getCurrency().getCode(),
    reserveBalance: group.getReserveFund().getBalance().toDecimalString(),
    members: group.getMembers().map(m => ({
      id: m.getId().getValue(),
      name: m.getName()
    }))
  };
}

export function serializeExpense(expense: Expense) {
  return {
    id: expense.getId().getValue(),
    groupId: expense.getGroupId().getValue(),
    payerId: expense.getPayerId().getValue(),
    total: expense.getTotalAmount().toDecimalString(),
    description: expense.getDescription(),
    occurredAt: expense.getOccurredAt().toISOString(),
    splits: expense.getSplits().map(s => ({
      memberId: s.getMemberId().getValue(),
      share: s.getShare().toDecimalString()
    }))
  };
}

export function serializeBalance(balance: MemberBalance, memberName?: string) {
  return {
    memberId: balance.getMemberId().getValue(),
    memberName,
    balance: balance.getBalance().toDecimalString(),
    isCreditor: balance.isCreditor(),
    isDebtor: balance.isDebtor()
  };
}

export function serializeSettlement(
  settlement: Settlement,
  names: Map<string, string>
) {
  return {
    fromMemberId: settlement.getFromMemberId().getValue(),
    fromMemberName: names.get(settlement.getFromMemberId().getValue()),
    toMemberId: settlement.getToMemberId().getValue(),
    toMemberName: names.get(settlement.getToMemberId().getValue()),
    amount: settlement.getAmount().toDecimalString()
  };
}

export function serializeGoal(goal: SavingsGoal) {
  return {
    id: goal.getId().getValue(),
    groupId: goal.getGroupId().getValue(),
    title: goal.getTitle(),
    target: goal.getTargetAmount().toDecimalString(),
    current: goal.getCurrentAmount().toDecimalString(),
    progressPercent: goal.getProgressPercent(),
    achieved: goal.isAchieved(),
    deadline: goal.getDeadline()?.toISOString() ?? null
  };
}
