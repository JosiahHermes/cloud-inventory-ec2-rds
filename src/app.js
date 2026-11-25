require('dotenv').config();

const express = require('express');
const pool = require('./config/db');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Inventory API (AWS Track A: EC2 + RDS MySQL)',
    status: 'running',
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message,
    });
  }
});

app.use('/items', itemsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON pada body tidak valid' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'SKU sudah terdaftar' });
  }

  console.error('[error]', err);
  return res.status(500).json({
    message: 'Terjadi kesalahan pada server',
    error: err.message,
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventory API berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
