import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: process.env.ENV_FILE || '.env' });

const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DB = 'trya',
} = process.env;

// Detecta se está rodando em produção (dist) ou desenvolvimento (src)
const isProduction = __dirname.includes('dist');
const basePath = isProduction ? 'dist' : 'src';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    join(
      process.cwd(),
      basePath,
      '**/infrastructure/typeorm/entities/*.entity.{ts,js}',
    ),
    join(process.cwd(), basePath, 'database/entities/*.entity.{ts,js}'),
    join(
      process.cwd(),
      basePath,
      'modules/tutorials/domain/entities/*.entity.{ts,js}',
    ),
  ],
  migrations: [join(process.cwd(), basePath, 'database/migrations/*.{ts,js}')],
});

export default AppDataSource;
