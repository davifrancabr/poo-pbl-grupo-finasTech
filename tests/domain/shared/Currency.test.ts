import { describe, expect, it } from 'vitest';
import { Currency } from '../../../src/domain/shared/Currency';

describe('Moeda', () => {
  it('Cria moeda após validar.', () => {
    const currency = Currency.fromCode('brl');
    expect(currency.getCode()).toBe('BRL');
  });

  it('Tem moedas predefinidas', () => {
    expect(Currency.BRL.getCode()).toBe('BRL');
    expect(Currency.USD.getCode()).toBe('USD');
  });

  it('Gera um erro em caso de código inválido.', () => {
    expect(() => Currency.fromCode('INVALID')).toThrow();
  });
});
