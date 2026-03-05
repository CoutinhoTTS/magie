import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/SQLite/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './magie.db',
  },
} satisfies Config
