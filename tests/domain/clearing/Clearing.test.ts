import { describe, expect, it } from 'vitest';
import { BalanceCalculator } from '../../../src/domain/clearing/BalanceCalculator';
import { ClearingService } from '../../../src/domain/clearing/ClearingService';
import { Expense } from '../../../src/domain/expenses/Expense';
import { ExpenseSplitCalculator } from '../../../src/domain/expenses/ExpenseSplitCalculator';
import { EqualSplitStrategy } from '../../../src/domain/expenses/SplitStrategy';
import { Group } from '../../../src/domain/group/Group';
import { Currency } from '../../../src/domain/shared/Currency';
import { Money } from '../../../src/domain/shared/Money';

describe('BalanceCalculator e ClearingService', () => {
  const BRL = Currency.BRL;
  const calculator = new ExpenseSplitCalculator();
  const balanceCalc = new BalanceCalculator();
  const clearing = new ClearingService();

  it('Calcula quem deve quem apos a divisão igualitária', () => {
    const group = Group.create('Test');
    const alice = group.addMember('Alice');
    const bob = group.addMember('Bob');
    const total = Money.fromDecimal('100.00', BRL);
    const splits = calculator.calculate(
      total,
      [alice.getId(), bob.getId()],
      new EqualSplitStrategy()
    );
    const expense = Expense.create(
      group.getId(),
      alice.getId(),
      total,
      splits,
      'Mercado'
    );
    const balances = balanceCalc.calculate(
      [alice.getId(), bob.getId()],
      [expense],
      [],
      BRL
    );
    const bobBalance = balances.find(b => b.getMemberId().equals(bob.getId()));
    expect(bobBalance?.isDebtor()).toBe(true);
    const settlements = clearing.simplify(balances);
    expect(settlements.length).toBeGreaterThan(0);
    expect(settlements[0]?.getAmount().toDecimalString()).toBe('50.00');
  });

  it('Produtos com zero liquidações quando balanceado.', () => {
    const group = Group.create('Test');
    const alice = group.addMember('Alice');
    const balances = balanceCalc.calculate([alice.getId()], [], [], BRL);
    const settlements = clearing.simplify(balances);
    expect(settlements).toHaveLength(0);
  });
});
