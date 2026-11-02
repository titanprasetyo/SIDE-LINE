import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const SYNC_FILE = path.resolve(process.cwd(), 'node_modules/.vite/side_line_reviews_sync.json')

function readSyncStore() {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SYNC_FILE, 'utf8'))
      return {
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
        deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
        deletedSigs: Array.isArray(parsed.deletedSigs) ? parsed.deletedSigs : [],
        updatedAt: parsed.updatedAt || Date.now(),
      }
    }
  } catch {
    // ignore
  }
  return { reviews: [], deletedIds: [], deletedSigs: [], updatedAt: Date.now() }
}

function writeSyncStore(state) {
  try {
    fs.mkdirSync(path.dirname(SYNC_FILE), { recursive: true })
    fs.writeFileSync(SYNC_FILE, JSON.stringify(state, null, 2), 'utf8')
  } catch {
    // ignore
  }
}

function getReviewSig(r) {
  if (!r) return ''
  return `${String(r.name || '').trim().toLowerCase()}|${String(r.comment || '').trim().toLowerCase()}`
}

function sideLineReviewsSyncPlugin() {
  const attachMiddleware = (middlewares) => {
    middlewares.use('/__api/reviews-sync', (req, res, next) => {
      if (req.method === 'GET') {
        const store = readSyncStore()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify(store))
        return
      }

      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}')
            const store = readSyncStore()
            const deletedIds = new Set((store.deletedIds || []).map(String))
            const deletedSigs = new Set(store.deletedSigs || [])

            if (Array.isArray(payload.deletedIds)) {
              for (const id of payload.deletedIds) deletedIds.add(String(id))
            }
            if (Array.isArray(payload.deletedSigs)) {
              for (const sig of payload.deletedSigs) if (sig) deletedSigs.add(sig)
            }

            if (payload.action === 'delete') {
              if (payload.id !== undefined && payload.id !== null) {
                deletedIds.add(String(payload.id))
              }
              if (payload.sig) {
                deletedSigs.add(payload.sig)
              }
            }

            const incoming = []
            if (payload.review) incoming.push(payload.review)
            if (Array.isArray(payload.reviews)) incoming.push(...payload.reviews)

            // Merge incoming + existing store.reviews, preferring items with small integer DB ids
            const combined = [...incoming, ...(store.reviews || [])]
            const bySig = new Map()

            for (const item of combined) {
              if (!item || !item.name || !item.comment) continue
              const idStr = String(item.id ?? '')
              const sig = getReviewSig(item)
              if (!sig || deletedIds.has(idStr) || deletedSigs.has(sig)) continue

              const existing = bySig.get(sig)
              if (!existing) {
                bySig.set(sig, item)
              } else {
                // Prefer item with a real DB id (small integer < 1e11) over Date.now() timestamp id
                const itemIsDb = Number(item.id) > 0 && Number(item.id) < 100000000000
                const existIsDb = Number(existing.id) > 0 && Number(existing.id) < 100000000000
                if (itemIsDb && !existIsDb) {
                  bySig.set(sig, item)
                }
              }
            }

            const mergedReviews = Array.from(bySig.values()).sort(
              (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )

            const nextStore = {
              reviews: mergedReviews,
              deletedIds: Array.from(deletedIds),
              deletedSigs: Array.from(deletedSigs),
              updatedAt: Date.now(),
            }
            writeSyncStore(nextStore)

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify(nextStore))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: err.message }))
          }
        })
        return
      }

      next()
    })
  }

  return {
    name: 'side-line-reviews-sync',
    configureServer(server) {
      attachMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sideLineReviewsSyncPlugin(),
  ],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})