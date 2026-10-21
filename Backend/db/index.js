const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'mindpatch',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'mindpatch',
    password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD || 'mindpatch',
    port: 5432,
});

module.exports = pool;
