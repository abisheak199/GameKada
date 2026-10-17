# Experiment 1: Local Game Catalog with Hooks and Routing

## Overview
Unit 3, Experiment 1 of the GameKada Steam-like e-commerce app. Built a local-data product catalog with 30 game titles, custom hooks for search/filter/sort, and React Router for navigation.

## Stack
- React 19.2.8 + Vite 8.3.0
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons

## Files Created

### `src/data/games.js`
Seed data with 30 major game titles. Each game has: `id, title, genre, platform, price, rating, releaseYear, developer, description, tags, inStock, image`. Also exports `GENRES`, `PLATFORMS`, `MAX_PRICE`, `MIN_PRICE` derived arrays/constants for filtering.

### `src/hooks/useGames.js`
Custom hook that encapsulates:
- `useState` for search term, genre filter, platform filter, max price, sort order
- `useMemo` for filtered/sorted game list
- Returns filtered games, filter state, setters, and derived constants

### `src/components/Navbar.jsx`
Sticky top navigation bar with:
- GameKada logo (link to Home)
- Cart link with item count badge (placeholder: 0)

### `src/components/ProductCard.jsx`
Reusable product card component:
- Game cover image (lazy-loaded)
- Genre badge
- Title link to product detail
- Price (INR) and release year
- Star rating
- Out-of-stock indicator

### `src/pages/Home.jsx`
Landing page with:
- Dark hero section with "Welcome to GameKada" heading
- "New Arrivals" badge
- Shop Games CTA button
- Featured games preview section

### `src/pages/Products.jsx`
Product listing page with:
- Left sidebar: search input, genre filter buttons, price range slider, sort dropdown
- Right grid: responsive product cards (1 col mobile, 2 tablet, 3 lg, 4 xl)
- Empty state with "Clear filters" option

### `src/pages/ProductDetail.jsx`
Individual product page:
- Breadcrumb navigation
- Large product image
- Title, genre, platform, price, rating
- Description text
- Tags
- Add to Cart button (disabled if out of stock)

### `src/App.jsx`
Router configuration with:
- `BrowserRouter` wrapper
- `Navbar` on all routes
- Routes: `/` (Home), `/products` (Products), `/products/:id` (ProductDetail)

### `src/index.css`
Added `@import "tailwindcss";` directive at top for Tailwind CSS v4.

### `vite.config.js`
Added `tailwindcss()` plugin to Vite config.

### `tailwind.config.js`
Custom theme with slate and indigo color extensions, system font stack.

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with hero and featured games |
| `/products` | Products | Full catalog with search, filters, sorting |
| `/products/:id` | ProductDetail | Individual game details page |

## Design Decisions
- **Simple & professional UI**: White background, slate text, indigo accents, generous whitespace
- **Responsive**: Mobile-first grid (1 col → 4 cols on desktop)
- **Local data first**: All 30 games stored in `src/data/games.js`, no API dependency
- **Custom hook pattern**: `useGames` encapsulates all filtering logic, keeping components presentational

## GitHub
Pushed to: https://github.com/AbisheakSaravanan/GameKada-GameShop

## Screenshots
- Homepage: captured at `http://localhost:5173/`
- Products page: captured at `http://localhost:5173/products`

## Next Experiment (Unit 3, Exp 2)
Add `useCart` hook + `CartContext` for add/remove/update/clear cart operations with localStorage persistence.
