import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

export default defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', 5432),
        user: env.get('DB_USER', 'postgres'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE', 'meeting_assistant'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})
