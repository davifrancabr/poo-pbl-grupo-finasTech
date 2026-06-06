import { Currency } from '../shared/Currency';
import { DomainError } from '../shared/DomainError';
import type { Money } from '../shared/Money';
import { GroupId } from './GroupId';
import { Member } from './Member';
import type { MemberId } from './MemberId';
import { ReserveFund } from './ReserveFund';

export class Group {
  private constructor(
    private readonly id: GroupId,
    private readonly name: string,
    private readonly currency: Currency,
    private readonly members: Map<string, Member>,
    private readonly reserveFund: ReserveFund
  ) {}

  static create(name: string, currency: Currency = Currency.BRL): Group {
    if (name.trim().length < 2)
      throw new DomainError(
        'Nome do grupo deve possuir pelo menos 2 caracteres'
      );

    return new Group(
      GroupId.create(),
      name.trim(),
      currency,
      new Map(),
      ReserveFund.create(currency)
    );
  }

  static reconstitute(
    id: GroupId,
    name: string,
    currency: Currency,
    members: Member[],
    reserveFund: ReserveFund
  ): Group {
    const group = new Group(id, name, currency, new Map(), reserveFund);

    for (const membro of members) {
      group.members.set(membro.getId().getValue(), membro);
    }

    return group;
  }

  getId(): GroupId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  getMembers(): readonly Member[] {
    return [...this.members.values()];
  }

  getReserveFund(): ReserveFund {
    return this.reserveFund;
  }

  addMember(name: string): Member {
    const member = Member.create(name);
    this.members.set(member.getId().getValue(), member);

    return member;
  }

  getMember(memberId: MemberId): Member | undefined {
    return this.members.get(memberId.getValue());
  }

  hasMembro(memberId: MemberId): boolean {
    return this.members.has(memberId.getValue());
  }

  requiredMember(memberId: MemberId): Member {
    const member = this.getMember(memberId);
    if (!member) throw new DomainError('Membro não encontrado no grupo.');

    return member;
  }

  contributeToReserve(
    memberId: MemberId,
    amount: Money,
    description: string
  ): void {
    this.requiredMember(memberId);
    this.reserveFund.contribute(memberId, amount, description);
  }

  withdrawFromReserve(
    memberId: MemberId,
    amount: Money,
    description: string
  ): void {
    this.requiredMember(memberId);
    this.reserveFund.withdraw(amount, description, memberId);
  }
}
