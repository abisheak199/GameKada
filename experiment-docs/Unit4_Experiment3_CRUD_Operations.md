# Unit 4 - Experiment 3: Product CRUD Operations

## Components
- Admin (Games tab with CRUD)
- ProductForm (add/edit modal)
- GameCard (admin view)

## Code

### src/components/AdminGames.jsx
```jsx
import { useState } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import ProductForm from './ProductForm'

export default function AdminGames({ games, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState(null)

  const handleAdd = () => { setEditingGame(null); setShowForm(true) }
  const handleEdit = (game) => { setEditingGame(game); setShowForm(true) }
  const handleDelete = (id) => { if (confirm('Delete this game?')) onDelete(id) }
  const handleSubmit = (data) => {
    if (editingGame) onUpdate(editingGame.id, data)
    else onAdd(data)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-100">Manage Games</h2>
        <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          <Plus size={16} className="mr-1" /> Add Game
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <img src={game.image} alt={game.title} className="w-full h-40 object-cover rounded mb-3" />
            <h3 className="font-semibold text-slate-100">{game.title}</h3>
            <p className="text-sm text-slate-400">{game.genre} · {game.platform}</p>
            <p className="text-lg font-bold text-indigo-400 mt-2">₹{game.price.toLocaleString('en-IN')}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(game)} className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"><Edit size={14} className="mx-auto" /></button>
              <button onClick={() => handleDelete(game.id)} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-500"><Trash2 size={14} className="mx-auto" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <ProductForm game={editingGame} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}
    </div>
  )
}
```

### src/components/ProductForm.jsx
```jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function ProductForm({ game, onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', genre: '', platform: '', price: '', rating: '', releaseYear: '', developer: '', description: '', tags: '', image: '', inStock: true })

  useEffect(() => { if (game) setForm(game) }, [game])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, price: Number(form.price), rating: Number(form.rating), releaseYear: Number(form.releaseYear), tags: form.tags.split(',').map(t => t.trim()) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">{game ? 'Edit' : 'Add'} Game</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="col-span-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded" required />
            <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded"><option value="Action">Action</option><option value="RPG">RPG</option><option value="Adventure">Adventure</option><option value="Sandbox">Sandbox</option><option value="Strategy">Strategy</option></select>
            <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded"><option value="PC">PC</option><option value="PlayStation">PlayStation</option><option value="Xbox">Xbox</option><option value="Nintendo Switch">Nintendo Switch</option></select>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price (INR)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" required />
            <input type="number" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} placeholder="Rating" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" />
            <input type="number" value={form.releaseYear} onChange={e => setForm({...form, releaseYear: e.target.value})} placeholder="Release Year" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" />
          </div>
          <input value={form.developer} onChange={e => setForm({...form, developer: e.target.value})} placeholder="Developer" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" />
          <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="Image URL" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={3} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded w-full" />
          <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (comma separated)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} /> In Stock</label>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">{game ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onCancel} className="flex-1 py-2 bg-slate-700 text-white rounded hover:bg-slate-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### src/api/games.js (CRUD methods)
```js
import axios from 'axios'

const RAWG_BASE_URL = import.meta.env.DEV ? '/api/rawg' : 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_API_KEY

const api = axios.create({ baseURL: RAWG_BASE_URL, params: { key: API_KEY } })

export const fetchGames = async (params = {}) => { const res = await api.get('/games', { params }); return res.data }
export const fetchGameById = async (id) => { const res = await api.get(`/games/${id}`); return res.data }
export const fetchGenres = async () => { const res = await api.get('/genres'); return res.data.results }
export const fetchPlatforms = async () => { const res = await api.get('/platforms'); return res.data.results }

export const mapRawgGameToInternal = (g) => ({
  id: g.id, title: g.name, genre: g.genres?.[0]?.name || 'Action',
  platform: g.platforms?.[0]?.platform?.name || 'PC',
  price: Math.min(Math.max(g.metacritic ? g.metacritic * 59.99 : g.rating * 1000 + 500, 299), 5999),
  rating: g.rating ? parseFloat(g.rating.toFixed(1)) : 4.0,
  releaseYear: g.released ? new Date(g.released).getFullYear() : 2024,
  developer: g.developers?.[0]?.name || 'Unknown',
  description: g.description_raw || g.description || 'No description.',
  tags: g.tags?.slice(0, 4).map(t => t.name) || [],
  inStock: true, image: g.background_image || '',
})

export const isApiConfigured = () => !!(API_KEY && API_KEY !== 'your_rawg_api_key_here')

// Local CRUD (since RAWG is read-only)
let localGamesCache = null
export const getLocalGames = () => JSON.parse(localStorage.getItem('gamekada_local_games') || '[]')
export const saveLocalGames = (games) => localStorage.setItem('gamekada_local_games', JSON.stringify(games))

export const createLocalGame = (game) => {
  const games = getLocalGames()
  const newGame = { ...game, id: Date.now(), image: game.image || 'https://via.placeholder.com/600x400' }
  saveLocalGames([...games, newGame])
  return newGame
}

export const updateLocalGame = (id, data) => {
  const games = getLocalGames().map(g => g.id === id ? { ...g, ...data } : g)
  saveLocalGames(games)
  return games.find(g => g.id === id)
}

export const deleteLocalGame = (id) => {
  saveLocalGames(getLocalGames().filter(g => g.id !== id))
}
```