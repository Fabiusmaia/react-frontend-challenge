# INSTRUCTIONS.md — CineDash

## Sobre o Projeto

**CineDash** é um dashboard de curadoria e descoberta de filmes para equipes de streaming. Curadores podem descobrir filmes em alta, filtrar por gênero/ano/nota, ver detalhes completos (sinopse, elenco, trailer) e gerenciar uma lista de filmes para catalogação.

---

## Pré-requisitos

- Node.js **v20+** (recomendado v22 para compatibilidade total com as dependências)
- npm v10+
- Chave de API do [TMDB](https://www.themoviedb.org/settings/api) (gratuita)

---

## Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd cinedash
```

### 2. Instale as dependências

```bash
npm install
```

> **Nota:** Se encontrar erro `Cannot find native binding` do rolldown, execute:
> ```bash
> npm install @rolldown/binding-win32-x64-msvc   # Windows x64
> # ou
> npm install @rolldown/binding-darwin-arm64      # macOS Apple Silicon
> # ou
> npm install @rolldown/binding-linux-x64-gnu     # Linux x64
> ```

### 3. Configure a chave da API do TMDB

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` e adicione sua chave:

```env
VITE_TMDB_API_KEY=sua_chave_aqui
```

Para obter uma chave gratuita:
1. Acesse [themoviedb.org](https://www.themoviedb.org/)
2. Crie uma conta gratuita
3. Vá em **Configurações → API → Criar → Aplicativo Pessoal**
4. Copie a **API Key (v3 auth)**

---

## Rodando o Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

### Build de produção

```bash
npm run build
npm run preview
```

### Testes

```bash
# Modo watch (interativo)
npm test

# Execução única
npm run test:run

# Com relatório de cobertura
npm run test:coverage
```

---

## Como usar

### Login

- Acesse `/login`
- Use **qualquer e-mail válido** e **qualquer senha com mais de 6 caracteres**
- Não há backend — a autenticação é simulada no front-end
- A sessão persiste após recarregar a página

### Dashboard de Descoberta (/)

- Exibe filmes em tendência da semana (TMDB Trending)
- **Busca**: digitar no campo filtra automaticamente (debounce de 500ms)
- **Filtros**: Gênero, Ano de Lançamento, Nota Mínima
- **Infinite Scroll**: role para baixo para carregar mais filmes
- Clique no **+** em qualquer card para adicionar à lista
- Clique no poster para ver os detalhes do filme

### Minha Lista (/watchlist)

- Tabela com todos os filmes adicionados
- **Ordenação**: clique nos cabeçalhos Título, Gênero ou Nota
- **Remover**: ícone de lixeira na coluna Ações
- Persiste após recarregar a página

### Detalhes do Filme (/movie/:id)

- Sinopse, elenco principal (até 8 membros), trailer do YouTube
- Botão para adicionar/remover da lista diretamente
- Backdrop do filme como hero visual

### Tema Dark/Light

- Botão de lua/sol no canto superior direito do header
- Preferência salva no `localStorage`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Core | React 19, TypeScript Strict, Vite 8 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 + persist |
| Roteamento | TanStack Router v1 |
| Tabela | TanStack Table v8 |
| UI | Shadcn/ui + TailwindCSS v4 |
| Formulários | React Hook Form + Zod v4 |
| Testes | Vitest v4 + happy-dom |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_TMDB_API_KEY` | Sim | Chave de API do TMDB (v3) |
