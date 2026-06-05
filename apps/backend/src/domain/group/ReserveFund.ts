import type { Currency } from '../shared/Currency';
import { DomainError } from '../shared/DomainError';
import { Money } from '../shared/Money';
import type { MemberId } from './MemberId';

export interface ReserveTransaction {
  memberId: MemberId;
  amount: Money;
  type: 'contribution' | 'withdrawal';
  description: string;
  occurredAt: Date;
}

export class ReserveFund {
  private balance: Money;
  private readonly transactions: ReserveTransaction[] = [];

  private constructor(currency: Currency) {
    this.balance = Money.zero(currency);
  }

  static create(currency: Currency): ReserveFund {
    return new ReserveFund(currency);
  }

  static reconstitute(
    currency: Currency,
    balance: Money,
    transactions: ReserveTransaction[]
  ): ReserveFund {
    const fund = new ReserveFund(currency);

    fund.balance = balance;
    fund.transactions.push(...transactions);
    return fund;
  }

  getBalance(): Money {
    return this.balance;
  }

  getTransactions(): readonly ReserveTransaction[] {
    return [...this.transactions];
  }

  contribute(memberId: MemberId, amount: Money, description: string): void {
    if (!amount.isPositive())
      throw new DomainError('Contribuição deve ser positivo.');

    this.balance = this.balance.add(amount);
    this.transactions.push({
      memberId,
      amount,
      type: 'contribution',
      description,
      occurredAt: new Date()
    });
  }

  withdraw(amount: Money, description: string, memberId: MemberId): void {
    if (!amount.isPositive()) throw new DomainError('Saque deve ser positivo.');

    if (this.balance.isLessThan(amount))
      throw new DomainError('Saldo insuficiente do fundo de reserva.');

    this.balance = this.balance.subtract(amount);
    this.transactions.push({
      memberId,
      amount,
      type: 'withdrawal',
      description,
      occurredAt: new Date()
    });
  }
}
