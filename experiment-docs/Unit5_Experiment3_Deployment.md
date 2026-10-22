# Unit 5 - Experiment 3: Deployment (GitHub Pages, Netlify, Vercel)

## Deployment Configs

### GitHub Pages (Already configured)
- `vite.config.js`: `base: '/GameKada/'`
- `public/404.html`: SPA redirect handler
- `package.json`: `deploy` script with `gh-pages -d dist`
- GitHub Actions: `.github/workflows/deploy.yml`

### Netlify Configuration

#### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### netlify/functions/auth.js (Serverless auth)
```js
export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = JSON.parse(req.body)
  // Verify against DB
  const user = await db.users.findOne({ email })
  if (!user || !verifyPassword(password, user.hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = generateJWT(user)
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
```

### Vercel Configuration

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "X-Frame-Options", "value": "DENY" }, { "key": "X-Content-Type-Options", "value": "nosniff" }] }
  ],
  "env": { "VITE_RAWG_API_KEY": "@rawg-api-key", "VITE_DATA_SOURCE": "api" }
}
```

#### api/auth.js (Vercel serverless)
```js
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body
  // Verify user
  const user = await verifyUser(email, password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ sub: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' })
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } })
}
```

### GitHub Actions Workflow

#### .github/workflows/deploy.yml
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, unit-5]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Environment Variables

#### .env (local)
```bash
VITE_RAWG_API_KEY=your_rawg_key
VITE_DATA_SOURCE=api
VITE_API_BASE=https://your-api.com
```

#### .env.production
```bash
VITE_RAWG_API_KEY=your_rawg_key
VITE_DATA_SOURCE=api
VITE_API_BASE=https://api.yourdomain.com
```

### Deployment Checklist
- [ ] GitHub Pages: Enable in repo Settings > Pages > gh-pages branch
- [ ] Netlify: Connect repo, set build command `npm run build`, publish `dist`
- [ ] Vercel: Import project, framework Vite, add env vars
- [ ] Test all routes work after deployment
- [ ] Verify cart, checkout, auth flow on live URLs
- [ ] Check PWA install prompt works