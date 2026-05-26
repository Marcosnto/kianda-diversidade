# Kianda Diversidade

Kianda diversidade é um coletivo da área da psicologia. Este repositório é um monorepo que reúne o site público e o painel administrativo do coletivo.

## Estrutura

O sistema é composto por 2 apps e pacotes compartilhados:

```text
kianda-diversidade/
├── apps/
│   ├── web/     # Site público (Next.js 15)
│   └── panel/   # Painel administrativo (Next.js 16)
└── packages/
    ├── db/                # Prisma, schema, migrations e helpers de dados (@workspace/db)
    ├── ui/                # Biblioteca de componentes compartilhada (@workspace/ui)
    ├── eslint-config/     # Configuração ESLint compartilhada
    └── typescript-config/ # Configuração TypeScript compartilhada
```

- **web**: site que exibe informações sobre o coletivo e expõe os artigos voltados para a área de psicologia.
- **panel**: painel administrativo que faz a gestão dos conteúdos do site e também dos pacientes dos psicólogos cadastrados.

## Stack

- **Monorepo**: [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces)
- **Framework**: Next.js (App Router) + React 19
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS 4 + Radix UI + componentes próprios em `packages/ui`
- **Formulários**: React Hook Form + Zod
- **Tema**: next-themes (suporte a dark mode)
- **Lint/Format**: Biome (panel), ESLint (web), Prettier
- **Banco de dados**: Prisma + MySQL em `packages/db`
- **Imagens**: ImageKit

## Pré-requisitos

- Node.js >= 20
- pnpm 10.4.1 (definido em `packageManager`)

## Setup

```bash
pnpm install
```

### Banco de dados

Os apps `web` e `panel` consomem os artigos pelo package `@workspace/db`.
As variáveis podem ficar no `.env.local` do app ou do package que executa os comandos:

```env
DATABASE_URL="mysql://..."
SHADOW_DATABASE_URL="mysql://..."
IMAGEKIT_PRIVATE_KEY="..."
```

Comandos úteis:

```bash
pnpm db:generate
pnpm db:migrate:dev
pnpm db:migrate:deploy
pnpm db:studio
```

## Scripts

Executados na raiz, via Turbo:

```bash
pnpm dev      # roda todos os apps em modo desenvolvimento
pnpm build    # build de todos os apps
pnpm lint     # lint em todos os pacotes
pnpm format   # formata o repositório com Prettier
```
