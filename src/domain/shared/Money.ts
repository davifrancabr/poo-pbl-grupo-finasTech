import { Currency } from './Currency';
import { DomainError } from './DomainError';

export class Money {
  private constructor(
    private readonly amount: bigint,
    private readonly currency: Currency
  ) {}

  static zero(currency: Currency): Money {
    return new Money(0n, currency);
  }

  static fromMinorUnit(amount: bigint, currency: Currency): Money {
    if (amount < 0n) throw new TypeError('Valor não pode ser negativo.');

    return new Money(amount, currency);
  }

  static fromSignedMinorUnit(amount: bigint, currency: Currency): Money {
    return new Money(amount, currency);
  }

  static fromDecimal(value: string, currency: Currency): Money {
    const trimmed = value.trim().replace(',', '.');
    if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
      throw new DomainError(`Invalid monetary value: ${value}`);
    }
    const negative = trimmed.startsWith('-');
    const normalized = negative ? trimmed.slice(1) : trimmed;
    const [whole, fraction = ''] = normalized.split('.');
    const paddedFraction = fraction.padEnd(2, '0').slice(0, 2);
    const minorUnits = BigInt(whole + paddedFraction);
    const result = new Money(minorUnits, currency);
    return negative ? result.negate() : result;
  }

  getAmount(): bigint {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  isZero(): boolean {
    return this.amount === 0n;
  }

  isNegative(): boolean {
    return this.amount < 0n;
  }

  isPositive(): boolean {
    return this.amount > 0n;
  }

  negate(): Money {
    return new Money(-this.amount, this.currency);
  }

  abs(): Money {
    return this.amount < 0n ? this.negate() : this;
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

    return new Money(BigInt(arredontado), this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new DomainError('Não pode dividir por 0.');

    const escala = Number(this.amount) / divisor;
    const arredondado = Math.round(escala);

    return new Money(BigInt(arredondado), this.currency);
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
    const negative = this.amount < 0n;
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
