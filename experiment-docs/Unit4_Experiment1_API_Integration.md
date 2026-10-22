# Unit 4 - Experiment 1: REST API Integration

## Components
- Products (uses useGames hook)
- ProductDetail (uses useGames hook)
- ProductCard
- Home (uses useGames hook)
- Loading
- Error display

## Code

### src/api/games.js
```js
import axios from 'axios'

const RAWG_BASE_URL = import.meta.env.DEV ? '/api/rawg' : 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_API_KEY

const api = axios.create({
  baseURL: RAWG_BASE_URL,
  params: { key: API_KEY },
})

export const fetchGames = async (params = {}) => {
  const response = await api.get('/games', { params })
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

export const mapRawgGameToInternal = (rawgGame) => ({
  id: rawgGame.id,
  title: rawgGame.name,
  genre: rawgGame.genres?.[0]?.name || 'Action',
  platform: rawgGame.platforms?.[0]?.platform?.name || 'PC',
  price: Math.min(Math.max(rawgGame.metacritic ? rawgGame.metacritic * 59.99 : rawgGame.rating * 1000 + 500, 299), 5999),
  rating: rawgGame.rating ? parseFloat(rawgGame.rating.toFixed(1)) : 4.0,
  releaseYear: rawgGame.released ? new Date(rawgGame.released).getFullYear() : 2024,
  developer: rawgGame.developers?.[0]?.name || 'Unknown',
  description: rawgGame.description_raw || rawgGame.description || 'No description available.',
  tags: rawgGame.tags?.slice(0, 4).map((t) => t.name) || [],
  inStock: true,
  image: rawgGame.background_image || '',
})

export const isApiConfigured = () => !!(API_KEY && API_KEY !== 'your_rawg_api_key_here')
```

### src/hooks/useGames.js (API integration)
```jsx
import { useState, useMemo, useEffect } from 'react'
import { games as localGames, GENRES as localGenres, PLATFORMS as localPlatforms } from '../data/games'
import { fetchGames, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured } from '../api/games'

export function useGames() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState(Infinity)
  const [sortBy, setSortBy] = useState('name')
  const [dataSource, setDataSource] = useState(import.meta.env.VITE_DATA_SOURCE || 'local')
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
          console.warn('[GameKada] RAWG API failed, falling back to local data:', err.message)
          setAllGames(localGames)
          setGenres(localGenres)
          setPlatforms(localPlatforms)
          setError(null)
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

  const MAX_PRICE = useMemo(() => allGames.length ? Math.max(...allGames.map((g) => g.price)) : 0, [allGames])
  const MIN_PRICE = useMemo(() => allGames.length ? Math.min(...allGames.map((g) => g.price)) : 0, [allGames])

  const filteredGames = useMemo(() => {
    const maxPrice = priceFilter === Infinity ? MAX_PRICE : priceFilter
    return allGames
      .filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) &&
        (genreFilter === 'all' || g.genre === genreFilter) &&
        (platformFilter === 'all' || g.platform === platformFilter) &&
        g.price <= maxPrice
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title)
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [allGames, search, genreFilter, platformFilter, priceFilter, sortBy, MAX_PRICE])

  return { games: filteredGames, allGames, GENRES, PLATFORMS, MAX_PRICE, MIN_PRICE, search, setSearch, genreFilter, setGenreFilter, platformFilter, setPlatformFilter, priceFilter, setPriceFilter, sortBy, setSortBy, dataSource, isLoading, error }
}
```