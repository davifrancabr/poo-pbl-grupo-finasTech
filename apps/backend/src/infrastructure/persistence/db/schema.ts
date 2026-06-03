import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const despesa = pgTable(
  'despesa',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    grupoId: uuid('grupo_id')
      .notNull()
      .references(() => grupo.id, {
        onDelete: 'cascade'
      }),
    pagadorId: uuid('pagador_id').notNull(),
    quantiaTotal: integer('quantia_total').notNull(),
    descricao: text('descricao').notNull(),
    ocorridoEm: timestamp('ocorrido_em').notNull().defaultNow()
  },
  t => [index('idx_despesa_group_id').on(t.grupoId)]
);

export const grupo = pgTable('grupo', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  moedaTipo: text('moeda_tipo').notNull().default('BRL'),
  criadoEm: timestamp('criado_em').notNull().defaultNow()
});

export const membro = pgTable(
  'membro',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    grupoId: uuid('grupo_id')
      .notNull()
      .references(() => grupo.id, {
        onDelete: 'cascade'
      })
  },
  t => [index('idx_membro_grupo_id').on(t.grupoId)]
);

export const despesaCompartilhada = pgTable(
  'despesa_compartilhada',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    despesaId: uuid('despesa_id')
      .notNull()
      .references(() => despesa.id, {
        onDelete: 'cascade'
      }),
    membroId: uuid('membro_id').notNull(),
    quantia: integer('quantia').notNull()
  },
  t => [index('idx_despesa_compartilhada_despasa_id').on(t.despesaId)]
);

export const transacaoReserva = pgTable(
  'transacao_reserva',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    grupoId: uuid('grupo_id')
      .notNull()
      .references(() => grupo.id, {
        onDelete: 'cascade'
      }),
    membroId: uuid('membro_id').notNull(),
    quantia: integer('quantia').notNull(),
    tipo: text('tipo').notNull(),
    descricao: text('descricao').notNull(),
    ocorridoEm: timestamp('ocorrido_em').notNull().defaultNow()
  },
  t => [index('idx_transacao_reserva_grupo_id').on(t.grupoId)]
);

export const metaEconomia = pgTable(
  'meta_economia',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    grupoId: uuid('grupo_id')
      .notNull()
      .references(() => grupo.id, {
        onDelete: 'cascade'
      }),
    titulo: text('titulo').notNull(),
    valorMeta: integer('valor_meta').notNull(),
    valorAtual: integer('valor_atual').notNull().default(0),
    prazo: timestamp('prazo')
  },
  t => [index('idx_meta_economia_grupo_id').on(t.grupoId)]
);

export const metaContribuicao = pgTable(
  'meta_contribuicao',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    metaEconomiaId: uuid('meta_economia_id')
      .notNull()
      .references(() => metaEconomia.id, {
        onDelete: 'cascade'
      }),
    membroId: uuid('membro_id').notNull(),
    quantia: integer('quantia').notNull(),
    contribuidoEm: timestamp('contribuido_em').defaultNow()
  },
  t => [index('idx_meta_contribuicao_meta_economia_id').on(t.metaEconomiaId)]
);

export const grupoRelation = relations(grupo, ({ many }) => ({
  membro: many(membro),
  despesa: many(despesa),
  transacaoReserva: many(transacaoReserva),
  metaEconomia: many(metaEconomia)
}));

export const mebroRelation = relations(membro, ({ one }) => ({
  grupo: one(grupo, {
    fields: [membro.grupoId],
    references: [grupo.id]
  })
}));

export const despesaRelation = relations(despesa, ({ one, many }) => ({
  grupo: one(grupo, {
    fields: [despesa.grupoId],
    references: [grupo.id]
  }),
  despesaCompartilhada: many(despesaCompartilhada)
}));

export const despesaCompartilhadaRelation = relations(
  despesaCompartilhada,
  ({ one }) => ({
    despesa: one(despesa, {
      fields: [despesaCompartilhada.despesaId],
      references: [despesa.id]
    })
  })
);

export const transacaoReservaRelation = relations(
  transacaoReserva,
  ({ one }) => ({
    grupo: one(grupo, {
      fields: [transacaoReserva.grupoId],
      references: [grupo.id]
    })
  })
);

export const metaEconomiaRelation = relations(
  metaEconomia,
  ({ one, many }) => ({
    grupo: one(grupo, {
      fields: [metaEconomia.grupoId],
      references: [grupo.id]
    }),
    metaContribuicao: many(metaContribuicao)
  })
);

export const metaContribuicaoRelation = relations(
  metaContribuicao,
  ({ one }) => ({
    metaEconomia: one(metaEconomia, {
      fields: [metaContribuicao.metaEconomiaId],
      references: [metaEconomia.id]
    })
  })
);
