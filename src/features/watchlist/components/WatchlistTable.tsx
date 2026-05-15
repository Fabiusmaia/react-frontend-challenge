import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Star, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { imageUrl } from '@/shared/api/client'
import { formatDate, formatRating } from '@/shared/lib/utils'
import { useWatchlistStore, type WatchlistMovie } from '@/features/watchlist/store/watchlistStore'
import { Link } from '@tanstack/react-router'

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUp className="ml-1 h-3 w-3" />
  if (sorted === 'desc') return <ArrowDown className="ml-1 h-3 w-3" />
  return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
}

export function WatchlistTable() {
  const { movies, removeMovie } = useWatchlistStore()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<WatchlistMovie>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Título
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={imageUrl(row.original.poster_path, 'w92')}
            alt={row.original.title}
            className="h-12 w-8 rounded object-cover flex-shrink-0"
          />
          <div>
            <Link
              to="/movie/$id"
              params={{ id: String(row.original.id) }}
              className="font-medium hover:text-primary transition-colors line-clamp-1"
            >
              {row.original.title}
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'genres',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Gênero
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      ),
      accessorFn: (row) => row.genres.map((g) => g.name).join(', '),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genres.slice(0, 2).map((g) => (
            <Badge key={g.id} variant="secondary" className="text-xs">
              {g.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'release_date',
      header: 'Lançamento',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'vote_average',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nota
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{formatRating(getValue() as number)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link to="/movie/$id" params={{ id: String(row.original.id) }}>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeMovie(row.original.id)}
            title="Remover da lista"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: movies,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-semibold mb-2">Sua lista está vazia</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Explore o dashboard de descoberta e adicione filmes à sua lista de curadoria.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-muted/30 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm text-muted-foreground">
        <span>{movies.length} filme{movies.length !== 1 ? 's' : ''} na lista</span>
      </div>
    </div>
  )
}
