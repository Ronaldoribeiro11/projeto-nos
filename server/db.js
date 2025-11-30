const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Vai ler o link da nuvem
  ssl: {
    rejectUnauthorized: false // Necessário para conexões seguras na nuvem
  }
});

module.exports = pool;