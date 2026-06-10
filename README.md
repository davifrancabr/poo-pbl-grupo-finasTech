# FinasTech

Plataforma de **finanças coletivas** para grupos de pessoas — amigos, familiares, colegas de república, viajantes. Divida despesas de forma justa, acompanhe quem deve a quem, gerencie um fundo de reserva compartilhado e crie metas de poupança coletivas.

---

## O que o sistema faz

- **Grupos** — crie e gerencie múltiplos grupos com moedas distintas (BRL, USD, EUR…)
- **Membros** — adicione participantes a cada grupo
- **Despesas** — registre gastos com divisão igualitária, por porcentagem ou por valor fixo
- **Saldos** — visualize em tempo real quem está no positivo e quem está devendo
- **Plano de acerto (Clearing)** — algoritmo que minimiza o número de transferências necessárias entre os membros
- **Fundo de reserva** — contribuições coletivas para uma reserva compartilhada do grupo
- **Metas de poupança** — defina objetivos com valor-alvo, prazo e acompanhe o progresso de cada contribuição

---

## Stack

| Camada          | Tecnologias                                                           |
| --------------- | --------------------------------------------------------------------- |
| **Frontend**    | HTML5, CSS3 (custom design system, sem frameworks), JavaScript ES2023 |
| **Backend**     | TypeScript, Fastify, Zod, `fastify-type-provider-zod`                 |
| **ORM / Banco** | Drizzle ORM + PostgreSQL (fallback em memória sem `DATABASE_URL`)     |
| **Runtime**     | Bun                                                                   |
| **Docs da API** | Swagger UI — `/docs`                                                  |

### Sobre o frontend

O frontend foi reescrito como uma **Single Page Application** (`index.html`) sem dependências de frameworks como Bootstrap ou jQuery. O design usa um sistema de tokens CSS próprio (tema escuro, tipografia `Syne` + `Inter`) e se comunica diretamente com a API REST do backend via `fetch`.

---

## Arquitetura

O projeto segue os princípios de **Clean Architecture** / **Domain-Driven Design**:

```bash
src/
├── domain/          # Entidades, value objects e regras de negócio puras
│   ├── clearing/    # BalanceCalculator, ClearingService, Settlement
│   ├── expenses/    # Expense, SplitStrategy (equal / percentage / fixed)
│   ├── group/       # Group, Member, ReserveFund
│   ├── savings/     # SavingsGoal, GoalContribution
│   └── shared/      # Money, Currency, EntityId, DomainError
├── application/     # Casos de uso e ports (interfaces de repositório)
│   ├── ports/       # ExpenseRepository, GroupRepository, SavingsGoalRepository
│   └── use-cases/   # CreateGroup, RecordExpense, GetClearingPlan…
├── infrastructure/  # Implementações concretas
│    ├── http/        # Servidor Fastify, rotas, serializers, container DI
│    └── persistence/
│        ├── drizzle/ # Repositórios Drizzle + schema + mappers
│        └── in-memory/ # Repositórios em memória (dev/teste sem banco)
```

---

## Pré-requisitos

- **Bun** 1.0+ — runtime e gerenciador de pacotes
- **Node.js** 20+ — compatibilidade com tooling
- **Docker** — para subir o PostgreSQL (opcional; sem ele o sistema usa repositório em memória)

---

## Como rodar

```bash
# 1. Instalar dependências
bun install

# 2. Subir o PostgreSQL via Docker (opcional)
docker compose up -d

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL se necessário
# Sem DATABASE_URL, o sistema opera com banco em memória automaticamente

# 4. Rodar as migrações (somente com Postgres ativo)
bun db:migrate

# 5. Iniciar o servidor
bun start
```

| Serviço      | URL                        |
| ------------ | -------------------------- |
| API REST     | http://localhost:3001      |
| Documentação | http://localhost:3001/docs |
| Frontend     | http://localhost:3000      |

---

## Endpoints da API

| Método | Rota                               | Descrição                         |
| ------ | ---------------------------------- | --------------------------------- |
| `GET`  | `/api/v1/groups`                   | Lista todos os grupos             |
| `POST` | `/api/v1/groups`                   | Cria um grupo                     |
| `GET`  | `/api/v1/groups/:id`               | Dashboard completo do grupo       |
| `POST` | `/api/v1/groups/:id/members`       | Adiciona membro ao grupo          |
| `POST` | `/api/v1/groups/:id/expenses`      | Registra despesa                  |
| `GET`  | `/api/v1/groups/:id/balances`      | Saldos individuais                |
| `GET`  | `/api/v1/groups/:id/clearing`      | Plano de acerto                   |
| `POST` | `/api/v1/groups/:id/reserve`       | Contribui para o fundo de reserva |
| `POST` | `/api/v1/groups/:id/goals`         | Cria meta de poupança             |
| `POST` | `/api/v1/goals/:goalId/contribute` | Contribui para uma meta           |

A documentação interativa completa está disponível em `/docs` (Swagger UI) com o servidor rodando.

---

## Testes

O projeto adota **TDD (Test-Driven Development)** como prática central no desenvolvimento do domínio e dos casos de uso. Os testes são escritos com **Vitest** e cobrem as três camadas internas da aplicação: domain, use-cases e integração entre elas via repositórios em memória — sem depender de banco de dados ou servidor HTTP.

### Rodar os testes

```bash
# Executa todos os testes
bun run test

# Modo watch (re-executa ao salvar)
bun run test --watch

# Com relatório de cobertura
bun run test --coverage
```

### Estrutura dos testes

```bash
tests/
├── domain/
│   ├── BalanceCalculator.test.ts   # Cálculo de saldos e plano de acerto
│   ├── Expense.test.ts             # Criação de despesas e estratégias de divisão
│   ├── Group.test.ts               # Grupos, membros e fundo de reserva
│   ├── SavingsGoal.test.ts         # Metas de poupança e contribuições
│   ├── Currency.test.ts            # Validação de moedas
│   └── Money.test.ts               # Operações monetárias com BigInt
└── application/
    └── use-cases.test.ts           # Casos de uso integrados com repos em memória
```

### O que é coberto

**Domain — `Money`**
Criação a partir de decimal e de unidade menor, adição, subtração, multiplicação (com arredondamento), divisão, comparação de igualdade, rejeição de moedas distintas e valores inválidos.

**Domain — `Currency`**
Normalização de código (`brl` → `BRL`), moedas predefinidas (`BRL`, `USD` e `EUR`) e rejeição de códigos inválidos.

**Domain — `Group`**
Criação com nome, adição de membros, contribuição e saque do fundo de reserva, rejeição de saque acima do saldo.

**Domain — `Expense` e estratégias de divisão**
Divisão igualitária com verificação de que a soma dos splits bate com o total, criação de despesa válida e rejeição quando a soma dos splits diverge do total.

**Domain — `SavingsGoal`**
Criação da meta, rastreamento de contribuições, cálculo de progresso percentual, marcação de meta concluída e rejeição de contribuições com valor zero.

**Domain — `BalanceCalculator` e `ClearingService`**
Cálculo de quem deve a quem após divisão igualitária, verificação do valor exato do acerto (`50.00`) e cenário sem liquidações quando o grupo está equilibrado.

**Application — casos de uso integrados**
Fluxo completo de criação de grupo + adição de membros, registro de despesa + cálculo de saldos + geração do plano de acerto, criação de meta + contribuição com verificação do progresso, e contribuição para o fundo de reserva com verificação do saldo resultante. Todos usando `InMemoryRepository` sem banco real.

---
