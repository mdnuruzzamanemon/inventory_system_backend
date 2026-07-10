import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseDbUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port || '5432', 10),
      name: u.pathname.replace(/^\//, ''),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl: u.searchParams.get('sslmode') === 'require',
    };
  } catch {
    return null;
  }
}

const dbUrl = process.env.DATABASE_URL || '';
const parsed = dbUrl ? parseDbUrl(dbUrl) : null;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  db: {
    host: parsed?.host || process.env.DB_HOST || 'localhost',
    port: parsed?.port || parseInt(process.env.DB_PORT || '5432', 10),
    name: parsed?.name || process.env.DB_NAME || 'inventory_db',
    user: parsed?.user || process.env.DB_USER || 'postgres',
    password: parsed?.password || process.env.DB_PASSWORD || 'postgres',
    ssl: parsed?.ssl || process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  reservationTtlSeconds: parseInt(process.env.RESERVATION_TTL_SECONDS || '60', 10),
};
