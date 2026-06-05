import type { Expense } from '../expenses/Expense';
import type { MemberId } from '../group/MemberId';
import type { ReserveTransaction } from '../group/ReserveFund';
import type { Currency } from '../shared/Currency';
import { Money } from '../shared/Money';
import { MemberBalance } from './MemberBalance';

export class BalanceCalculator {
  calculate(
    memberIds: MemberId[],
    expenses: Expense[],
    reserveTransactions: readonly ReserveTransaction[],
    currency: Currency
  ) {
    const balances = new Map<string, number>();

    for (const id of memberIds) {
      balances.set(id.getValue(), 0);
    }

    for (const expense of expenses) {
      const payerId = expense.getPayerId().getValue();
      const payerBalance = balances.get(payerId) ?? 0;

      balances.set(
        payerId,
        payerBalance + expense.getTotalAmount().getAmount()
      );

      for (const split of expense.getSplits()) {
        const memberId = split.getMemberId().getValue();
        const current = balances.get(memberId) ?? 0;

        balances.set(memberId, current - split.getShare().getAmount());
      }
    }

    for (const tx of reserveTransactions) {
      const memberId = tx.memberId.getValue();
      const current = balances.get(memberId) ?? 0;

      const delta =
        tx.type === 'contribution'
          ? tx.amount.getAmount()
          : -tx.amount.getAmount();

      balances.set(memberId, current + delta);
    }

    return memberIds.map(id => {
      const minor = balances.get(id.getValue()) ?? 0;

      return new MemberBalance(id, Money.fromSignedMinorUnit(minor, currency));
    });
  }
}
