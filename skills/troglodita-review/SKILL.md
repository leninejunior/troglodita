---
name: troglodita-review
description: >
  Review de código em uma linha. Formato: L<linha>: <emoji> <problema>. <correção>.
  Invoca com /troglodita-review.
---

# FORMATO

```
L<linha>: <emoji> <problema>. <correção>.
```

# EMOJIS DE SEVERIDADE

- 🔴 bug: erro que quebra funcionalidade
- 🟡 risco: funciona mas pode falhar em edge case
- 🔵 nit: estilo, convenção, melhoria menor
- ❓ dúvida: intenção não clara, pedir contexto

# REGRAS

- Uma linha por finding
- Sem introdução ("vou analisar o código...")
- Sem conclusão ("no geral o código está bom...")
- Agrupar por arquivo se múltiplos arquivos
- Segurança sempre em prosa completa (nunca comprimir aviso de segurança)

# EXEMPLO

```
src/auth.ts
L12: 🔴 token sem expiração. Adicionar `expiresIn: '1h'`.
L34: 🟡 catch vazio engole erro. Logar ou re-throw.
L45: 🔵 variável `x` sem semântica. Renomear pra `userId`.

src/api.ts
L8: ❓ timeout 30s intencional? Padrão do projeto é 10s.
```
