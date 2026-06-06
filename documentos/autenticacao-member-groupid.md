# Autenticação e `groupId` na tabela `Members`

## Contexto atual

No esquema atual de persistência em `src/infrastructure/persistence/drizzle/schema.ts`, a tabela `Members` contém um campo:

- `groupId` (FK para `Groups.id`)

Isso modela um membro como pertencente obrigatoriamente a um único grupo.

## Faz sentido receber `groupId` na tabela `Members`?

Sim, faz sentido se a modelagem de domínio for:

- cada membro pertence a exatamente um grupo;
- não há membros compartilhados entre múltiplos grupos;
- o sistema precisa saber de qual grupo o membro faz parte para consultar despesas, metas, reservas etc.

Nesse caso, ter `groupId` como coluna da tabela `Members` é uma relação natural:

- garante integridade referencial;
- permite consultas mais simples de membros por grupo;
- evita uma tabela de associação extra quando a relação é 1:N.

## Quando não faz sentido

Não faz sentido armazenar `groupId` direto em `Members` se:

- um mesmo usuário puder participar de vários grupos;
- a associação `membro ↔ grupo` for muitos-para-muitos;
- a identidade do usuário não estiver ligada a um único grupo no modelo de autenticação.

Nesses casos, o correto é usar uma tabela de junção, por exemplo `MemberGroups`, contendo `memberId` e `groupId`.

## Autenticação versus autorização

Para implementação de autenticação, a entrada típica deve ser:

- `email`
- `password`

O `groupId` normalmente não deve ser recebido no login, porque ele é um detalhe de autorização/contexto e não da verificação da identidade.

Fluxo recomendado:

1. o usuário faz login com `email` + `password`
2. o sistema valida as credenciais
3. o sistema recupera o(s) grupo(s) associado(s) ao membro
4. o sistema devolve um token ou sessão com o escopo apropriado

Assim, `groupId` pode existir no banco para representar a associação, mas não precisa ser parte do payload de autenticação.

## Recomendações práticas

- Se a regra do negócio é `um membro pertence a um único grupo`, manter `groupId` em `Members` é aceitável.
- Se a regra do negócio é `um membro pode estar em vários grupos`, refatore para uma tabela de associação e não use um único `groupId` em `Members`.
- Durante o login, não peça `groupId` a menos que haja um motivo claro de contexto de grupo na fase de autenticação.
- Use `groupId` para escopo/autorizações depois do login, não para validar senha.

## Exemplo simplificado

```ts
// login: apenas email e password
const user = await memberRepository.findByEmail(email);
if (!user || !verifyPassword(password, user.password)) {
  throw new Error('Credenciais inválidas');
}

// após autenticar, obter o grupo
const groupId = user.groupId; // válido se o membro pertencer a um único grupo
```

> Resumo: `groupId` em `Members` faz sentido para um domínio 1:N membro-grupo, mas não precisa ser parte do fluxo de autenticação. Para M:N, prefira uma tabela de junção.
