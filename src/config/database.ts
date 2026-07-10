import { Sequelize } from 'sequelize';
import pg from 'pg';
import { env } from './env';

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: pg,
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.password,
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: env.db.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
