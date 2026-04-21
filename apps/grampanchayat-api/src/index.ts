import 'dotenv/config'
import { app }      from './app.js'
import { db, pgClient } from './db/index.js'
import { sql }     from 'drizzle-orm'
import { env }     from './config/index.js'

async function bootstrap() {
  await db.execute(sql`SELECT 1`)
  console.log('DB connected')

  const server = app.listen(env.PORT, () => {
    console.log(`API running on port ${env.PORT} [${env.NODE_ENV}]`)
  })

  const shutdown = async (signal: string) => {
    console.log(`${signal} received — starting graceful shutdown`)

    server.close(async () => {
      try {
        await pgClient.end()
        console.log('DB connection pool closed')
        process.exit(0)
      } catch (err) {
        console.error('Error during shutdown:', err)
        process.exit(1)
      }
    })

    // Force exit if graceful shutdown takes > 30s
    setTimeout(() => {
      console.error('Shutdown timeout — forcing exit')
      process.exit(1)
    }, 30_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
