import { useState, useMemo } from 'react'
import { games, GENRES, PLATFORMS, MAX_PRICE, MIN_PRICE } from '../data/games'

export function useGames() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('name')

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const matchesSearch = g.title
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesGenre =
          genreFilter === 'all' || g.genre === genreFilter
        const matchesPlatform =
          platformFilter === 'all' || g.platform === platformFilter
        const matchesPrice = g.price <= priceFilter
        return matchesSearch && matchesGenre && matchesPlatform && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title)
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [search, genreFilter, platformFilter, priceFilter, sortBy])

  return {
    games: filteredGames,
    allGames: games,
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
  }
}
