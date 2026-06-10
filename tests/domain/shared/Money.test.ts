import { describe, expect, it } from 'vitest';
import { Currency } from '../../../src/domain/shared/Currency';
import { DomainError } from '../../../src/domain/shared/DomainError';
import { Money } from '../../../src/domain/shared/Money';

describe('Dinheiro', () => {
  const BRL = Currency.BRL;

  it('Cria dinheiro a partir de um número decimal.', () => {
    const money = Money.fromDecimal('10.50', BRL);
    expect(money.getAmount()).toBe(1050n);
    expect(money.toDecimalString()).toBe('10.50');
  });

  it('Gera dinheiro a partir de uma unidade menorer', () => {
    const money = Money.fromMinorUnit(250n, BRL);
    expect(money.toDecimalString()).toBe('2.50');
  });

  it('Adiciona 2 valores', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('5.50', BRL);
    expect(a.add(b).toDecimalString()).toBe('15.50');
  });

  it('Subtrai 2 valores', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('3.25', BRL);
    expect(a.subtract(b).toDecimalString()).toBe('6.75');
  });

  it('Multiplica arredondando para cima pela metade', () => {
    const money = Money.fromDecimal('10.00', BRL);
    expect(money.multiply(0.333).toDecimalString()).toBe('3.33');
  });

  it('Divide igualmente', () => {
    const money = Money.fromDecimal('10.00', BRL);
    expect(money.divide(4).toDecimalString()).toBe('2.50');
  });

  it('Apresenta erros ao operar com moedas diferentes.', () => {
    const brl = Money.fromDecimal('10.00', Currency.BRL);
    const usd = Money.fromDecimal('10.00', Currency.USD);
    expect(() => brl.add(usd)).toThrow(DomainError);
  });

  it('Compara igualdade', () => {
    const a = Money.fromDecimal('10.00', BRL);
    const b = Money.fromDecimal('10.00', BRL);
    const c = Money.fromDecimal('10.01', BRL);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('Gera erro em caso de decimal inválido.', () => {
    expect(() => Money.fromDecimal('abc', BRL)).toThrow(DomainError);
  });

  it('Lida com zero', () => {
    const zero = Money.zero(BRL);
    expect(zero.isZero()).toBe(true);
  });
});
