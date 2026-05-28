---
name: troglodita-commit
description: >
  Gera mensagens de commit concisas no formato Conventional Commits.
  Assunto <= 50 chars, modo imperativo, sem enrolação.
  Invoca com /troglodita-commit.
---

# FORMATO

```
<tipo>(<escopo>): <descrição imperativa>
```

- Assunto: máximo 50 caracteres
- Modo imperativo: "adicionar", "corrigir", "remover" (não "adicionado", "corrigido")
- Corpo só quando o "porquê" não é óbvio pelo diff
- Sem atribuição de IA

# TIPOS

feat | fix | refactor | perf | docs | test | chore | build | ci | style | revert

# EXEMPLOS

```
feat(auth): adicionar login via Google OAuth
fix(api): corrigir leak de conexão no pool PG
refactor(docs): extrair validação pra middleware
perf(query): indexar busca por CPF
chore(deps): atualizar prisma pra 6.x
```

# ESCOPO

Inferir do path dos arquivos alterados. Se múltiplos escopos, usar o mais relevante.
Se não há escopo claro, omitir parênteses.

# CORPO (opcional)

Só incluir quando:
- Breaking change (prefixar com `BREAKING CHANGE:`)
- Motivação não óbvia pelo diff
- Trade-off consciente que futuro dev precisa saber
