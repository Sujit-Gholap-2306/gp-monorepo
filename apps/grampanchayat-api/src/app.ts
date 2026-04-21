import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import routes from './routes/index.ts'
import { exceptionFilter } from './common/exceptions/exception.filter.ts'
import { requestIdMiddleware } from './common/middleware/request-id.ts'
import { env } from './config/index.ts'

const app = express()

// Trust proxy — required for rate-limit / IP detection behind load balancer
app.set('trust proxy', 1)

// Request ID — must be first so all subsequent middleware/handlers have req.id
app.use(requestIdMiddleware)

// Security headers
app.use(helmet())

// Structured request logging
app.use(pinoHttp({
  genReqId: (req) => req.id as string,
  autoLogging: { ignore: (req) => req.url === '/health' },
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}))

// Global rate limit — 200 req / 15 min per IP
app.use(rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            200,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { success: false, message: 'Too many requests, please try again later' },
}))

// CORS
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())

// Health check — unauthenticated, no rate-limit
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/v1', routes)

// Global error handler — must be last
app.use(exceptionFilter)

export { app }
