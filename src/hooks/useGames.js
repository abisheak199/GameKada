import { useState, useMemo, useEffect, useCallback } from 'react'
import { games as localGames, GENRES as localGenres, PLATFORMS as localPlatforms } from '../data/games'
import { fetchGames, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured } from '../api/games'

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

  // Load games from API or local data
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
          // API failed — silently fall back to local data (don't block the UI with error screen)
          console.warn('[GameKada] RAWG API failed, falling back to local data:', err.message)
          setAllGames(localGames)
          setGenres(localGenres)
          setPlatforms(localPlatforms)
          setError(null) // clear error so Products page still renders
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

  const MAX_PRICE = useMemo(() => {
    if (allGames.length === 0) return 0
    return Math.max(...allGames.map((g) => g.price))
  }, [allGames])

  const MIN_PRICE = useMemo(() => {
    if (allGames.length === 0) return 0
    return Math.min(...allGames.map((g) => g.price))
  }, [allGames])

  const filteredGames = useMemo(() => {
    const maxPrice = priceFilter === Infinity ? MAX_PRICE : priceFilter
    return allGames
      .filter((g) => {
        const matchesSearch = g.title
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesGenre =
          genreFilter === 'all' || g.genre === genreFilter
        const matchesPlatform =
          platformFilter === 'all' || g.platform === platformFilter
        const matchesPrice = g.price <= maxPrice
        return matchesSearch && matchesGenre && matchesPlatform && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title)
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [allGames, search, genreFilter, platformFilter, priceFilter, sortBy, MAX_PRICE])

  return {
    games: filteredGames,
    allGames,
    GENRES,
    PLATFORMS,
    MAX_PRICE,
    MIN_PRICE,
    search,
    setSearch,
    genreFilter,
    setGenreFilter,
    platformFilter,
    setPlatformFilter,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
    dataSource,
    isLoading,
    error,
  }
}