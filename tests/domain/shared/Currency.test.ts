import { describe, expect, it } from 'vitest';
import { Currency } from '../../../src/domain/shared/Currency';

describe('Currency', () => {
  it('creates from valid code', () => {
    const currency = Currency.fromCode('brl');
    expect(currency.getCode()).toBe('BRL');
  });

  it('has predefined currencies', () => {
    expect(Currency.BRL.getCode()).toBe('BRL');
    expect(Currency.USD.getCode()).toBe('USD');
  });

  it('throws on invalid code', () => {
    expect(() => Currency.fromCode('INVALID')).toThrow();
  });
});
