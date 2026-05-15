import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useGenres } from '@/features/movies/hooks/useMovies'
import type { MoviesFilters as Filters } from '@/shared/types/tmdb'

interface MoviesFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: Omit<Filters, 'page' | 'query'>
  onFiltersChange: (filters: Omit<Filters, 'page' | 'query'>) => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)
const RATINGS = [6, 7, 7.5, 8, 8.5, 9]

export function MoviesFilters({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
}: MoviesFiltersProps) {
  const { data: genres } = useGenres()

  const hasActiveFilters = Boolean(filters.genre || filters.year || filters.minRating)

  const clearFilters = () => {
    onFiltersChange({})
    onSearchChange('')
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar filmes..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        {/* Genre filter */}
        <Select
          value={filters.genre ? String(filters.genre) : 'all'}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, genre: val === 'all' ? undefined : Number(val) })
          }
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os gêneros</SelectItem>
            {genres?.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year filter */}
        <Select
          value={filters.year ? String(filters.year) : 'all'}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, year: val === 'all' ? undefined : Number(val) })
          }
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating filter */}
        <Select
          value={filters.minRating ? String(filters.minRating) : 'all'}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, minRating: val === 'all' ? undefined : Number(val) })
          }
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Nota mínima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer nota</SelectItem>
            {RATINGS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                ≥ {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(hasActiveFilters || searchValue) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
