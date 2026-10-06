import { Pool } from 'pg';

declare global {
    var _pgPool: Pool | undefined;
}

function createPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return new Pool({ connectionString: process.env.DATABASE_URL });
}

export const pool: Pool = process.env.NODE_ENV === 'production'
    ? createPool()
    : (global._pgPool ??= createPool());