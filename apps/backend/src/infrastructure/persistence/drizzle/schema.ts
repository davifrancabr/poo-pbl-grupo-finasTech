import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const groups = pgTable('Groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  currencyCode: text('currency_code').notNull().default('BRL'),
  createdAt: timestamp('createdAt').notNull().defaultNow()
});

export const members = pgTable(
  'Members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    groupId: uuid('groupId')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' })
  },
  t => [index('Member_groupId_idx').on(t.groupId)]
);

export const expenses = pgTable(
  'Expense',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('groupId')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    payerId: uuid('payerId').notNull(),
    totalAmount: integer('totalAmount').notNull(),
    description: text('description').notNull(),
    occurredAt: timestamp('occurredAt').notNull().defaultNow()
  },
  t => [index('Expense_groupId_idx').on(t.groupId)]
);

export const expenseSplits = pgTable(
  'ExpenseSplit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    expenseId: uuid('expenseId')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    memberId: uuid('memberId').notNull(),
    shareAmount: integer('shareAmount').notNull()
  },
  t => [index('ExpenseSplit_expenseId_idx').on(t.expenseId)]
);

export const reserveTransactions = pgTable(
  'ReserveTransaction',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('groupId')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    memberId: uuid('memberId').notNull(),
    amount: integer('amount').notNull(),
    type: text('type').notNull(),
    description: text('description').notNull(),
    occurredAt: timestamp('occurredAt').notNull().defaultNow()
  },
  t => [index('ReserveTransaction_groupId_idx').on(t.groupId)]
);

export const savingsGoals = pgTable(
  'SavingsGoal',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('groupId')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    targetAmount: integer('targetAmount').notNull(),
    currentAmount: integer('currentAmount').notNull().default(0),
    deadline: timestamp('deadline')
  },
  t => [index('SavingsGoal_groupId_idx').on(t.groupId)]
);

export const goalContributions = pgTable(
  'GoalContribution',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    goalId: uuid('goalId')
      .notNull()
      .references(() => savingsGoals.id, { onDelete: 'cascade' }),
    memberId: uuid('memberId').notNull(),
    amount: integer('amount').notNull(),
    contributedAt: timestamp('contributedAt').notNull().defaultNow()
  },
  t => [index('GoalContribution_goalId_idx').on(t.goalId)]
);
export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(members),
  expenses: many(expenses),
  reserveTxs: many(reserveTransactions),
  savingsGoals: many(savingsGoals)
}));

export const membersRelations = relations(members, ({ one }) => ({
  group: one(groups, {
    fields: [members.groupId],
    references: [groups.id]
  })
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id]
  }),
  splits: many(expenseSplits)
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id]
  })
}));

export const reserveTransactionsRelations = relations(
  reserveTransactions,
  ({ one }) => ({
    group: one(groups, {
      fields: [reserveTransactions.groupId],
      references: [groups.id]
    })
  })
);

export const savingsGoalsRelations = relations(
  savingsGoals,
  ({ one, many }) => ({
    group: one(groups, {
      fields: [savingsGoals.groupId],
      references: [groups.id]
    }),
    contributions: many(goalContributions)
  })
);

export const goalContributionsRelations = relations(
  goalContributions,
  ({ one }) => ({
    goal: one(savingsGoals, {
      fields: [goalContributions.goalId],
      references: [savingsGoals.id]
    })
  })
);
