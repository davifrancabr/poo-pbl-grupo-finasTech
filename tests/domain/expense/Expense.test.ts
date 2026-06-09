import { describe, expect, it } from 'vitest';
import { Expense } from '../../../src/domain/expenses/Expense';
import { ExpenseSplitCalculator } from '../../../src/domain/expenses/ExpenseSplitCalculator';
import { EqualSplitStrategy } from '../../../src/domain/expenses/SplitStrategy';
import { GroupId } from '../../../src/domain/group/GroupId';
import { MemberId } from '../../../src/domain/group/MemberId';
import { Currency } from '../../../src/domain/shared/Currency';
import { DomainError } from '../../../src/domain/shared/DomainError';
import { Money } from '../../../src/domain/shared/Money';

describe('Despesa e Estrategia de divisão', () => {
  const BRL = Currency.BRL;
  const groupId = GroupId.create();
  const alice = MemberId.create();
  const bob = MemberId.create();
  const calculator = new ExpenseSplitCalculator();

  it('Divide igualmente entre os participantes.', () => {
    const total = Money.fromDecimal('100.00', BRL);
    const splits = calculator.calculate(
      total,
      [alice, bob],
      new EqualSplitStrategy()
    );
    expect(splits).toHaveLength(2);
    const sum = splits.reduce((a, s) => a.add(s.getShare()), Money.zero(BRL));
    expect(sum.equals(total)).toBe(true);
  });

  it('Cria despesas com divisões válidas.', () => {
    const total = Money.fromDecimal('90.00', BRL);
    const splits = calculator.calculate(
      total,
      [alice, bob],
      new EqualSplitStrategy()
    );
    const expense = Expense.create(groupId, alice, total, splits, 'Jantar');
    expect(expense.getDescription()).toBe('Jantar');
    expect(expense.getTotalAmount().equals(total)).toBe(true);
  });

  it('Rejeita despesas quando a divisão ultrapassa o total.', () => {
    const total = Money.fromDecimal('100.00', BRL);
    const wrongSplit = calculator.calculate(
      Money.fromDecimal('50.00', BRL),
      [alice, bob],
      new EqualSplitStrategy()
    );
    expect(() =>
      Expense.create(groupId, alice, total, wrongSplit, 'Invalid')
    ).toThrow(DomainError);
  });
});
