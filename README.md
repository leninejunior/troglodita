<p align="center">🦴</p>
<h1 align="center">troglodita</h1>
<p align="center"><i>por que gastar muitos tokens quando poucos resolve?</i></p>

<p align="center">
  <a href="https://github.com/lenineJunior/troglodita/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
  <a href="#instalar"><img src="https://img.shields.io/badge/idioma-PT--BR-blue" alt="PT-BR"></a>
</p>

---

Compressão de tokens feita pra quem usa agentes de IA **em português**. O inglês tem o [caveman](https://github.com/JuliusBrussee/caveman) — o Brasil tem o troglodita.

Economia de **~70% nos tokens de saída** sem perder precisão técnica.

## Antes e Depois

| | Normal | Troglodita |
|---|--------|------------|
| **Debug** | "O componente está re-renderizando porque você está criando uma nova referência de objeto a cada ciclo de renderização. Isso acontece porque objetos inline são recriados sempre que o componente renderiza." | "Re-render: ref nova cada ciclo (objeto inline recriado). Resolver com `useMemo`." |
| **Erro** | "O erro que você está vendo acontece porque a variável `user` pode ser nula nesse ponto do código. Isso geralmente ocorre quando a requisição de autenticação ainda não retornou." | "Erro: `user` possivelmente null. Auth request ainda não retornou. Adicionar null check antes do acesso." |
| **Setup** | "Para configurar o projeto, primeiro você precisa instalar as dependências com npm install, depois criar o arquivo .env com as variáveis de ambiente necessárias, e por fim rodar as migrations do banco de dados." | "Setup: `npm i` → criar `.env` com vars → rodar migrations." |
| **Review** | "Eu notei que na linha 42 você está usando uma query SQL concatenada diretamente com input do usuário, o que pode representar uma vulnerabilidade de SQL injection." | "L42: 🔴 SQL injection — input do user concatenado na query. Usar parameterized query." |

```
╔════════════════════════════════╗
║  ~70% menos tokens de saída   ║
║  100% precisão técnica        ║
║  3 níveis: leve/total/máximo  ║
║  feito pro dev BR 🇧🇷          ║
╚════════════════════════════════╝
```

## Níveis

- **leve** — remove muletas e enrolação, mantém frases completas
- **total** — telegrafia técnica + ações no imperativo (padrão)
- **máximo** — abreviações, setas pra causalidade, mínimo absoluto

## Instalar

**macOS / Linux / WSL:**

```bash
curl -fsSL https://raw.githubusercontent.com/lenineJunior/troglodita/main/install.sh | bash
```

**Windows (Git Bash / WSL):**

```bash
curl -fsSL https://raw.githubusercontent.com/lenineJunior/troglodita/main/install.sh | bash
```

Requisitos: **Node.js >= 18**. Instalação em ~30 segundos.

## O que vem incluso

| Comando | O que faz |
|---------|-----------|
| `/troglodita` | Ativa compressão (leve/total/máximo) |
| `/troglodita-commit` | Commit conciso no formato Conventional Commits |
| `/troglodita-review` | Review em uma linha por finding |
| `/troglodita-help` | Cartão de referência rápida |

## Agentes suportados

| Agente | Status |
|--------|--------|
| Claude Code | ✅ |
| Cursor | ✅ |
| Codex | ✅ |
| Outros | em breve |

## Como funciona

1. Instala skills/regras no seu agente de IA
2. O agente recebe instruções pra comprimir respostas em PT-BR
3. Remove muletas ("basicamente", "na verdade", "essencialmente")
4. Diagnósticos em telegrafia, ações no imperativo
5. Termos técnicos, código e paths nunca são alterados

## Por que não usar o caveman?

O [caveman](https://github.com/JuliusBrussee/caveman) funciona pra inglês. As regras dele ("drop the/a/an, drop just/really/basically") não se aplicam ao português. O troglodita foi feito do zero pra gramática do PT-BR:

- Português tem 8 artigos com concordância de gênero — remover todos quebra a compreensão
- As muletas verbais do PT-BR são diferentes ("na verdade", "vale ressaltar", "basicamente")
- A estrutura de compressão respeita a sintaxe do português

## Pra quem é

- Vibecoder que conversa em português com o agente
- Dev BR que quer gastar menos tokens
- Qualquer pessoa que usa agentes de IA em PT-BR

## Créditos

Inspirado pelo [caveman](https://github.com/JuliusBrussee/caveman) de Julius Brussee (MIT).

## Licença

MIT — livre que nem mamute na planície aberta.
