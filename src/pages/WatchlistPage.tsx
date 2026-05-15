import { Bookmark, Trash2 } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { WatchlistTable } from '@/features/watchlist/components/WatchlistTable'
import { Button } from '@/shared/components/ui/button'
import { useWatchlistStore } from '@/features/watchlist/store/watchlistStore'

export function WatchlistPage() {
  const { movies, clearWatchlist } = useWatchlistStore()

  return (
    <Layout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Minha Lista</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {movies.length === 0
              ? 'Nenhum filme na lista ainda'
              : `${movies.length} filme${movies.length !== 1 ? 's' : ''} na sua lista de curadoria`}
          </p>
        </div>
        {movies.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearWatchlist} className="shrink-0">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar lista
          </Button>
        )}
      </div>

      <WatchlistTable />
    </Layout>
  )
}
