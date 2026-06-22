require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());

connectDB();

app.use('/health', require('./routes/health'));

app.use((err, req, res, next) => {
  void next;
  process.stderr.write(`${err.stack}\n`);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`);
});

module.exports = app;
