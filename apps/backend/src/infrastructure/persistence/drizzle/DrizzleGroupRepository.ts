import type { GroupRepository } from '@/application/ports/GroupRepository';
import type { Group } from '@/domain/group/Group';
import type { GroupId } from '@/domain/group/GroupId';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { GroupMapper } from '../mappers/GroupMapper';
import { db } from './client';
import { groups, members, reserveTransactions } from './schema';

export class DrizzleGroupRepository implements GroupRepository {
  async save(group: Group): Promise<void> {
    const id = group.getId().getValue();
    const memberRows = group.getMembers().map(m => ({
      id: m.getId().getValue(),
      name: m.getName(),
      groupId: id
    }));

    const reserveRows = group
      .getReserveFund()
      .getTransactions()
      .map(tx => ({
        id: uuidv4(),
        groupId: id,
        memberId: tx.memberId.getValue(),
        amount: tx.amount.getAmount(),
        type: tx.type,
        description: tx.description,
        occurredAt: tx.occurredAt
      }));

    await db.transaction(async tx => {
      await tx
        .insert(groups)
        .values({
          id,
          name: group.getName(),
          currencyCode: group.getCurrency().getCode()
        })
        .onConflictDoUpdate({
          target: groups.id,
          set: {
            name: group.getName(),
            currencyCode: group.getCurrency().getCode()
          }
        });
      await tx.delete(members).where(eq(members.groupId, id));
      if (memberRows.length > 0) await tx.insert(members).values(memberRows);

      await tx
        .delete(reserveTransactions)
        .where(eq(reserveTransactions.groupId, id));
      if (reserveRows.length > 0)
        await tx.insert(reserveTransactions).values(reserveRows);
    });
  }

  async findById(id: GroupId): Promise<Group | null> {
    const row = await db.query.groups.findFirst({
      where: eq(groups.id, id.getValue()),
      with: { members: true, reserveTxs: true }
    });

    return row ? GroupMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Group[]> {
    const rows = await db.query.groups.findMany({
      with: { members: true, reserveTxs: true },
      orderBy: (g, { desc }) => [desc(g.createdAt)]
    });

    return rows.map(GroupMapper.toDomain);
  }
}
