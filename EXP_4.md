# Experiment 4: API Integration with RAWG

## Overview
Unit 4, Experiment 1 of the GameKada Steam-like e-commerce app. Integrated the RAWG Video Games Database API to fetch real game data (350,000+ titles) instead of using local mock data. Added a configurable data source toggle (local vs API), loading states, error handling with retry, and a complete API service layer with axios.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Axios (HTTP client)
- RAWG Video Games Database API (free tier: 20,000 requests/month)
- Context API + custom hooks (AuthContext, CartContext, useGames)

## Data Sources

| Source | Description |
|--------|-------------|
| `local` | Uses `src/data/games.js` with 30 pre-defined games (default, no API key needed) |
| `api` | Fetches from RAWG API (requires free API key from https://rawg.io/apidocs) |

## Files Created

### `src/api/games.js`
Complete RAWG API service layer with axios:

```javascript
import axios from 'axios'

const RAWG_BASE_URL = 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_API_KEY

const api = axios.create({
  baseURL: RAWG_BASE_URL,
  params: {
    key: API_KEY,
  },
})

export const fetchGames = async (params = {}) => {
  const {
    page = 1,
    page_size = 30,
    search = '',
    platform = '',
    genre = '',
    ordering = '',
    dates = '',
  } = params

  const response = await api.get('/games', {
    params: {
      page,
      page_size,
      search: search || undefined,
      platforms: platform || undefined,
      genres: genre || undefined,
      ordering: ordering || undefined,
      dates: dates || undefined,
    },
  })

  return response.data
}

export const fetchGameById = async (id) => {
  const response = await api.get(`/games/${id}`)
  return response.data
}

export const fetchGenres = async () => {
  const response = await api.get('/genres')
  return response.data.results
}

export const fetchPlatforms = async () => {
  const response = await api.get('/platforms')
  return response.data.results
}

export const mapRawgGameToInternal = (rawgGame) => {
  return {
    id: rawgGame.id,
    title: rawgGame.name,
    genre: rawgGame.genres?.[0]?.name || 'Action',
    platform: rawgGame.platforms?.[0]?.platform?.name || 'PC',
    price: Math.round(rawgGame.metacritic ? rawgGame.metacritic * 10 : 1000),
    rating: rawgGame.metacritic ? rawgGame.metacritic / 20 : 4.0,
    releaseYear: rawgGame.released ? new Date(rawgGame.released).getFullYear() : 2024,
    developer: rawgGame.developers?.[0]?.name || 'Unknown',
    description: rawgGame.description_raw || rawgGame.description || 'No description available.',
    tags: rawgGame.tags?.map((t) => t.name) || [],
    inStock: true,
    image: rawgGame.background_image || '',
  }
}

export const isApiConfigured = () => {
  return !!(API_KEY && API_KEY !== 'your_rawg_api_key_here')
}
```

### `.env.example`
Environment variable template:

```bash
# RAWG Video Games Database API key (free tier: 20,000 requests/month)
# Get your key at: https://rawg.io/apidocs
VITE_RAWG_API_KEY=your_rawg_api_key_here

# Data source: 'local' or 'api'
VITE_DATA_SOURCE=local
```

### `src/hooks/useGames.js` — Updated
Now supports both local and API data sources with loading/error states:

```javascript
export function useGames() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState(Infinity)
  const [sortBy, setSortBy] = useState('name')
  const [dataSource, setDataSource] = useState(
    import.meta.env.VITE_DATA_SOURCE || 'local'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [allGames, setAllGames] = useState(localGames)
  const [GENRES, setGenres] = useState(localGenres)
  const [PLATFORMS, setPlatforms] = useState(localPlatforms)

  useEffect(() => {
    const loadGames = async () => {
      const source = import.meta.env.VITE_DATA_SOURCE || 'local'
      setDataSource(source)

      if (source === 'api' && isApiConfigured()) {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetchGames({ page_size: 40 })
          const mappedGames = response.results.map(mapRawgGameToInternal)
          setAllGames(mappedGames)
          const genres = await fetchGenres()
          setGenres(genres.map((g) => g.name))
          const platforms = await fetchPlatforms()
          setPlatforms(platforms.map((p) => p.name))
        } catch (err) {
          setError(err.message)
          setAllGames(localGames)
          setGenres(localGenres)
          setPlatforms(localPlatforms)
        } finally {
          setIsLoading(false)
        }
      } else {
        setAllGames(localGames)
        setGenres(localGenres)
        setPlatforms(localPlatforms)
      }
    }

    loadGames()
  }, [])

  // ... MAX_PRICE, MIN_PRICE, filteredGames computed values

  return {
    games: filteredGames,
    allGames,
    GENRES,
    PLATFORMS,
    MAX_PRICE,
    MIN_PRICE,
    search, setSearch,
    genreFilter, setGenreFilter,
    platformFilter, setPlatformFilter,
    priceFilter, setPriceFilter,
    sortBy, setSortBy,
    dataSource, isLoading, error,
  }
}
```

### `src/pages/Products.jsx` — Updated
Added loading spinner and error state UI:

```jsx
if (isLoading) {
  return (
    <main className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading games from API...</p>
      </div>
    </main>
  )
}

if (error) {
  return (
    <main className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-slate-400 mb-4">Failed to load games from API.</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Retry
        </button>
      </div>
    </main>
  )
}
```

## Unit 4 Requirements Met

- [x] RAWG API service layer with axios (`src/api/games.js`)
- [x] Environment variable configuration (`.env.example`)
- [x] Dual data source support (local fallback + API)
- [x] Loading state with spinner during API fetch
- [x] Error state with retry button on API failure
- [x] Game data mapping from RAWG format to internal format
- [x] Genre and platform fetching from API
- [x] Production build passes with 0 errors
- [x] Fallback to local data if API key missing or request fails
- [x] Code pushed to GitHub (`unit-4` branch)
- [x] Webpage screenshot captured

## How to Enable API Mode

1. Get a free API key at https://rawg.io/apidocs (use `http://localhost:5173` as the site URL)
2. Copy `.env.example` to `.env`
3. Add your key: `VITE_RAWG_API_KEY=your_actual_key`
4. Set `VITE_DATA_SOURCE=api`
5. Restart the dev server: `npm run dev`

Without an API key, the app continues to work with local data seamlessly.

## API Status
- RAWG API key configured and working
- Vite proxy routes `/api/rawg` → `https://api.rawg.io/api` (bypasses CORS in browser)
- Dev server proxies API requests to avoid CORS issues
- Local data fallback if API fails
