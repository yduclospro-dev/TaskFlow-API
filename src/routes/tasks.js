const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body || {};

    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    });

    return res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'task not found' });
    }

    return res.status(200).json(task);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
