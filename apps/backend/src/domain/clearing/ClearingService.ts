import type { MemberId } from '../group/MemberId';
import type { Money } from '../shared/Money';
import type { MemberBalance } from './MemberBalance';
import { Settlement } from './Settlement';

export class ClearingService {
  simplify(balances: MemberBalance[]): Settlement[] {
    const creditors = this.extractCreditors(balances);
    const debtors = this.extractDebtors(balances);

    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i]!;
      const debtor = debtors[j]!;
      this.processSettlement(
        creditor,
        debtor,
        creditors,
        debtors,
        settlements,
        i,
        j
      );

      if (creditors[i]?.amount.isZero()) i++;
      if (debtors[j]?.amount.isZero()) j++;
    }

    return settlements;
  }

  private extractCreditors(
    balances: MemberBalance[]
  ): { id: MemberId; amount: Money }[] {
    const creditors: { id: MemberId; amount: Money }[] = [];
    for (const mb of balances) {
      if (mb.isCreditor()) {
        creditors.push({ id: mb.getMemberId(), amount: mb.getBalance() });
      }
    }
    creditors.sort((a, b) =>
      Number(b.amount.getAmount() - a.amount.getAmount())
    );
    return creditors;
  }

  private extractDebtors(
    balances: MemberBalance[]
  ): { id: MemberId; amount: Money }[] {
    const debtors: { id: MemberId; amount: Money }[] = [];
    for (const mb of balances) {
      if (mb.isDebtor()) {
        debtors.push({ id: mb.getMemberId(), amount: mb.getBalance().abs() });
      }
    }
    debtors.sort((a, b) => Number(b.amount.getAmount() - a.amount.getAmount()));
    return debtors;
  }

  private processSettlement(
    creditor: { id: MemberId; amount: Money },
    debtor: { id: MemberId; amount: Money },
    creditors: { id: MemberId; amount: Money }[],
    debtors: { id: MemberId; amount: Money }[],
    settlements: Settlement[],
    i: number,
    j: number
  ): void {
    const amount = creditor.amount.isLessThan(debtor.amount)
      ? creditor.amount
      : debtor.amount;

    if (!amount.isZero()) {
      settlements.push(new Settlement(debtor.id, creditor.id, amount));
    }

    const newCreditor = creditor.amount.subtract(amount);
    const newDebtor = debtor.amount.subtract(amount);

    if (!newCreditor.isZero()) {
      creditors[i] = { id: creditor.id, amount: newCreditor };
    }

    if (!newDebtor.isZero()) {
      debtors[j] = { id: debtor.id, amount: newDebtor };
    }
  }
}
