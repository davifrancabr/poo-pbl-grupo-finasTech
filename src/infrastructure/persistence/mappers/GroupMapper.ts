import { Group } from '@/domain/group/Group';
import { GroupId } from '@/domain/group/GroupId';
import { Member } from '@/domain/group/Member';
import { MemberId } from '@/domain/group/MemberId';
import { ReserveFund } from '@/domain/group/ReserveFund';
import { Currency } from '@/domain/shared/Currency';
import { Money } from '@/domain/shared/Money';
import type { InferSelectModel } from 'drizzle-orm';
import type { groups, members, reserveTransactions } from '../drizzle/schema';

type GroupRow = InferSelectModel<typeof groups>;
type GroupWithRelations = GroupRow & {
  members: InferSelectModel<typeof members>[];
  reserveTxs: InferSelectModel<typeof reserveTransactions>[];
};

export class GroupMapper {
  static toDomain(row: GroupWithRelations): Group {
    const currency = Currency.fromCode(row.currencyCode);
    let balance = Money.zero(currency);

    const transactions = row.reserveTxs.map(tx => {
      const amount = Money.fromMinorUnit(tx.amount, currency);
      if (tx.type === 'contribution') {
        balance = balance.add(amount);
      } else {
        balance.subtract(amount);
      }
      return {
        memberId: MemberId.create(tx.memberId),
        amount,
        type: tx.type as 'contribution' | 'withdrawal',
        description: tx.description,
        occurredAt: tx.occurredAt
      };
    });

    const reserveFund = ReserveFund.reconstitute(
      currency,
      balance,
      transactions
    );

    const memberList = row.members.map(m =>
      Member.create(m.name, MemberId.create(m.id))
    );

    return Group.reconstitute(
      GroupId.create(row.id),
      row.name,
      currency,
      memberList,
      reserveFund
    );
  }
}
