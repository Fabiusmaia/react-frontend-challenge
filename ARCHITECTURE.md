# ARCHITECTURE.md — CineDash

## Visão Geral

CineDash é um dashboard de curadoria de filmes construído com React 18, TypeScript strict e uma pilha moderna de ferramentas. As decisões arquiteturais foram pensadas para escalar com o crescimento do produto.

---

## Estrutura de Pastas (Feature-Sliced Design)

```
src/
├── app/                    # Camada de aplicação (bootstrap, providers, router)
│   ├── providers.tsx       # QueryClientProvider + ThemeApplier + RouterProvider
│   └── router.tsx          # Definição das rotas com guards
│
├── pages/                  # Componentes de rota (thin layer — só compõem features)
│   ├── LoginPage.tsx
│   ├── HomePage.tsx        # Discovery dashboard
│   ├── WatchlistPage.tsx
│   └── MoviePage.tsx       # Movie details (/movie/:id)
│
├── features/               # Lógica de negócio isolada por domínio
│   ├── auth/
│   │   ├── components/     # LoginForm
│   │   ├── schemas/        # loginSchema (Zod) + testes
│   │   └── store/          # authStore (Zustand + persist)
│   ├── movies/
│   │   ├── api/            # moviesApi (chamadas TMDB)
│   │   ├── components/     # MovieCard, MovieCardSkeleton, MoviesFilters
│   │   └── hooks/          # useMovies (TanStack Query keys + queries)
│   └── watchlist/
│       ├── components/     # WatchlistTable (TanStack Table)
│       └── store/          # watchlistStore (Zustand + persist)
│
└── shared/                 # Código reutilizável entre features
    ├── api/                # axios client (tmdbClient, imageUrl)
    ├── components/
    │   ├── ui/             # Shadcn/ui components (Button, Input, Card, etc.)
    │   ├── Layout.tsx      # Header + nav + main wrapper
    │   └── Toaster.tsx     # Toast notifications
    ├── hooks/              # useDebounce, useToast
    ├── lib/                # cn(), formatDate(), formatRating()
    ├── store/              # themeStore (Zustand + persist)
    └── types/              # Tipos TMDB (Movie, Genre, Credits, etc.)
```

### Por que FSD?

Feature-Sliced Design força a direcionalidade de dependências: `pages` importam de `features`, `features` importam de `shared` — nunca o contrário. Isso evita acoplamento circular e facilita extrair ou substituir um domínio sem efeitos colaterais.

---

## Decisões Técnicas

### Autenticação (Simulada)

Sem backend, a autenticação é gerenciada inteiramente no frontend:

1. **Validação via Zod** — `loginSchema` valida e-mail e senha (> 6 chars) antes de qualquer ação.
2. **Token fictício** — `generateToken()` faz `btoa()` do payload `{ email, iat }` e prefixa com `cinedash_`.
3. **Persistência** — o Zustand `persist` middleware salva `{ token, user, isAuthenticated }` no `localStorage` (chave `cinedash-auth`). Ao recarregar, o estado é reidratado automaticamente.
4. **Route guards** — o TanStack Router `beforeLoad` checa `useAuthStore.getState().isAuthenticated` e redireciona para `/login` se não autenticado (ou para `/` se já autenticado tentando acessar `/login`).

**Por que não usar cookies?** Para um desafio front-end sem backend, `localStorage` é mais simples e igualmente seguro para o escopo proposto. Em produção, JWT em cookies `HttpOnly` seria a escolha.

### Server State com TanStack Query

Cada operação TMDB tem uma **query key tipada** definida em `movieKeys`:

```ts
movieKeys.trending(page)     // ['movies', 'trending', 1]
movieKeys.detail(id)         // ['movies', 'detail', 123]
movieKeys.discover(filters)  // ['movies', 'discover', {...}]
```

Isso garante invalidação precisa, evita re-fetches desnecessários e torna o devtools legível.

**Infinite Scroll** usa `useInfiniteQuery` com `getNextPageParam` derivado de `page < total_pages`. O trigger é um `IntersectionObserver` via `react-intersection-observer` apontado para um elemento sentinela no rodapé da lista.

**Debounce** — o input de busca tem `useDebounce(500ms)`. A query só dispara quando o valor debounced muda, evitando flood na API.

### Client State com Zustand

Dois stores com `persist`:

| Store | localStorage key | O que persiste |
|---|---|---|
| `authStore` | `cinedash-auth` | token, user, isAuthenticated |
| `watchlistStore` | `cinedash-watchlist` | movies (array completo) |
| `themeStore` | `cinedash-theme` | theme ('dark' \| 'light') |

O `watchlistStore` usa `partialize` implicitamente (persiste tudo) — em um projeto maior, faríamos `partialize` explícito para evitar vazar estado transitório.

### Roteamento com TanStack Router

Rotas tipadas com `createRoute` + `beforeLoad` para guards. O `router` é exportado e registrado globalmente via `declare module` para type-safety nas chamadas de navegação.

### UI com Shadcn/ui + TailwindCSS v4

Tailwind v4 usa a nova sintaxe `@theme {}` no CSS ao invés de `tailwind.config.js`. As variáveis CSS do sistema de design (cores, radius) são declaradas em `:root` e `.dark` no `index.css`, e expostas ao Tailwind via `@theme`.

O tema Dark/Light é aplicado adicionando a classe `dark` no `document.documentElement`, o que ativa as variáveis CSS do tema escuro definidas no seletor `.dark`.

### TanStack Table (Watchlist)

A tabela usa `getCoreRowModel` + `getSortedRowModel`. A ordenação é gerenciada por estado local `SortingState` e aplicada client-side (todos os filmes da watchlist já estão em memória).

---

## Desafios com a API do TMDB

1. **Sem campo `genres` em listagens** — `/trending` e `/discover` retornam `genre_ids` (array de IDs), não objetos `Genre`. Resolvido buscando os gêneros uma vez (`/genre/movie/list`, `staleTime: 1h`) e mapeando localmente nos cards.

2. **Paginação vs. Infinite Scroll** — A API limita a 500 páginas (20 filmes/página = 10.000 resultados). O `useInfiniteQuery` para quando `page >= total_pages`.

3. **Busca vs. Discover** — `/search/movie` não suporta filtros de gênero/ano simultaneamente com texto. A lógica em `useInfiniteMovies` prioriza busca textual quando há query, e usa `/discover` quando há filtros sem texto.

4. **Idioma** — O client axios envia `language: 'pt-BR'` por padrão, mas nem todos os filmes têm tradução. Títulos originais aparecem quando não há tradução disponível.

---

## Testes

22 testes unitários cobrindo:
- `loginSchema` — validação Zod (email, senha, edge cases)
- `authStore` — login, logout, geração de token, derivação de nome
- `watchlistStore` — add, remove, duplicate prevention, clear, timestamp
- `useDebounce` — timer, reset, delay

Framework: Vitest + happy-dom (jsdom substituído por compatibilidade com Node 20 + módulos ESM).
