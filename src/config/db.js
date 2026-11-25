const mysql = require('mysql2/promise');

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  console.warn(
    `[db] Environment variable belum lengkap: ${missingVars.join(', ')}. Pastikan file .env sudah dibuat.`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
