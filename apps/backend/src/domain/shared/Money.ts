import { Currency } from './Currency';
import { DomainError } from './DomainError';

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}

  static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  static fromMinorUnit(amount: number, currency: Currency): Money {
    if (amount < 0) throw new TypeError('Valor não pode ser negativo.');

    return new Money(amount, currency);
  }

  static fromSignedMinorUnit(amount: number, currency: Currency): Money {
    return new Money(amount, currency);
  }

  static fromDecimal(amount: number, currency: Currency): Money {
    const negative = amount < 0;
    return negative
      ? new Money(amount, currency).negate()
      : new Money(amount, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  negate(): Money {
    return new Money(-this.amount, this.currency);
  }

  abs(): Money {
    return this.amount < 0 ? this.negate() : this;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);

    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);

    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor))
      throw new DomainError('Fator deve ser um número finito.');

    const escala = Number(this.amount) * factor;
    const arredontado = Math.round(escala);

    return new Money(arredontado, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new DomainError('Não pode dividir por 0.');

    const escala = Number(this.amount) / divisor;
    const arredondado = Math.round(escala);

    return new Money(arredondado, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);

    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);

    return this.amount < other.amount;
  }

  toDecimalString(): string {
    const negative = this.amount < 0;
    const abs = negative ? -this.amount : this.amount;
    const str = abs.toString().padStart(3, '0');
    const whole = str.slice(0, -2) || '0';
    const fraction = str.slice(-2);

    return negative ? `-${whole}.${fraction}` : `${whole}.${fraction}`;
  }

  private assertSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency))
      throw new DomainError('Não pode calcular 2 moedas distintas.');
  }
}
