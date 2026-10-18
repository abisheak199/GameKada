import axios from 'axios'

const RAWG_BASE_URL = import.meta.env.DEV ? '/api/rawg' : 'https://api.rawg.io/api'
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

// Map RAWG API response to the app's internal game format
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