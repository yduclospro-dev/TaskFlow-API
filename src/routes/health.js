const express = require('express');
const { version } = require('../../package.json');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    version,
  });
});

module.exports = router;
