import { describe, expect, it } from 'vitest';
import { GroupId } from '../../../src/domain/group/GroupId';
import { MemberId } from '../../../src/domain/group/MemberId';
import { SavingsGoal } from '../../../src/domain/savings/SavingsGoal';
import { Currency } from '../../../src/domain/shared/Currency';
import { DomainError } from '../../../src/domain/shared/DomainError';
import { Money } from '../../../src/domain/shared/Money';

describe('Meta de Poupança', () => {
  const groupId = GroupId.create();
  const memberId = MemberId.create();

  it('Cria meta de poupança.', () => {
    const goal = SavingsGoal.create(
      groupId,
      'Viagem de formatura',
      Money.fromDecimal('5000.00', Currency.BRL)
    );
    expect(goal.getTitle()).toBe('Viagem de formatura');
    expect(goal.getProgressPercent()).toBe(0);
  });

  it('Rastreia as contribuições.', () => {
    const goal = SavingsGoal.create(
      groupId,
      'Reserva',
      Money.fromDecimal('1000.00', Currency.BRL)
    );
    goal.contribute(memberId, Money.fromDecimal('250.00', Currency.BRL));
    expect(goal.getCurrentAmount().toDecimalString()).toBe('250.00');
    expect(goal.getProgressPercent()).toBe(25);
  });

  it('Marca a meta como concluída.', () => {
    const goal = SavingsGoal.create(
      groupId,
      'Meta',
      Money.fromDecimal('100.00', Currency.BRL)
    );
    goal.contribute(memberId, Money.fromDecimal('100.00', Currency.BRL));
    expect(goal.isAchieved()).toBe(true);
  });

  it('Rejeita contribuições negativas.', () => {
    const goal = SavingsGoal.create(
      groupId,
      'Meta',
      Money.fromDecimal('100.00', Currency.BRL)
    );
    expect(() => goal.contribute(memberId, Money.zero(Currency.BRL))).toThrow(
      DomainError
    );
  });
});
