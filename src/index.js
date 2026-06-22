require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());
app.use('/health', require('./routes/health'));

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT}\n`);
  });
};

start().catch((err) => {
  process.stderr.write(`${err.stack}\n`);
  process.exit(1);
});

module.exports = app;
