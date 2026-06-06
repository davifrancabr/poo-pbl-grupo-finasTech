import { describe, expect, it } from 'vitest';
import { Currency } from '../../../src/domain/shared/Currency';
import { DomainError } from '../../../src/domain/shared/DomainError';
import { Money } from '../../../src/domain/shared/Money';

describe('Money', () => {
  const BRL = Currency.BRL;

  it('creates money from decimal string', () => {
    const money = Money.fromDecimal('10.50', BRL);
    expect(money.getAmount()).toBe(1050n);
    expect(money.toDecimalString()).toBe('10.50');
  });

  it('creates money from minor units', () => {
    const money = Money.fromMinorUnit(250n, BRL);
    expect(money.toDecimalString()).toBe('2.50');
  });

  it('adds two money values', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('5.50', BRL);
    expect(a.add(b).toDecimalString()).toBe('15.50');
  });

  it('subtracts two money values', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('3.25', BRL);
    expect(a.subtract(b).toDecimalString()).toBe('6.75');
  });

  it('multiplies with rounding half-up', () => {
    const money = Money.fromDecimal('10.00', BRL);
    expect(money.multiply(0.333).toDecimalString()).toBe('3.33');
  });

  it('divides equally', () => {
    const money = Money.fromDecimal('10.00', BRL);
    expect(money.divide(4).toDecimalString()).toBe('2.50');
  });

  it('throws when operating on different currencies', () => {
    const brl = Money.fromDecimal('10.00', Currency.BRL);
    const usd = Money.fromDecimal('10.00', Currency.USD);
    expect(() => brl.add(usd)).toThrow(DomainError);
  });

  it('compares equality', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('10.00', BRL);
    const c = Money.fromDecimal('10.01', BRL);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('throws on invalid decimal', () => {
    expect(() => Money.fromDecimal('abc', BRL)).toThrow(DomainError);
  });

  it('handles zero', () => {
    const zero = Money.zero(BRL);
    expect(zero.isZero()).toBe(true);
  });
});
