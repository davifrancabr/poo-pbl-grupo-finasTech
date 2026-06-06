import { describe, expect, it } from 'vitest';
import { Group } from '../../../src/domain/group/Group';
import { Currency } from '../../../src/domain/shared/Currency';
import { DomainError } from '../../../src/domain/shared/DomainError';
import { Money } from '../../../src/domain/shared/Money';

describe('Group', () => {
  it('creates a group with name', () => {
    const group = Group.create('República Finas');
    expect(group.getName()).toBe('República Finas');
    expect(group.getMembers()).toHaveLength(0);
  });

  it('adds members', () => {
    const group = Group.create('Viagem SP');
    const member = group.addMember('Alice');
    expect(group.getMembers()).toHaveLength(1);
    expect(group.hasMembro(member.getId())).toBe(true);
  });

  it('manages reserve fund contributions', () => {
    const group = Group.create('República');
    const alice = group.addMember('Alice');
    const amount = Money.fromDecimal('50.00', Currency.BRL);
    group.contributeToReserve(alice.getId(), amount, 'Fundo mensal');
    expect(group.getReserveFund().getBalance().equals(amount)).toBe(true);
  });

  it('rejects withdrawal exceeding balance', () => {
    const group = Group.create('República');
    const alice = group.addMember('Alice');
    const amount = Money.fromDecimal('100.00', Currency.BRL);
    expect(() =>
      group.withdrawFromReserve(alice.getId(), amount, 'Saque')
    ).toThrow(DomainError);
  });
});
