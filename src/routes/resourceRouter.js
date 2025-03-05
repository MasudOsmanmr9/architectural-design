const express = require('express');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('./redisClient'); // Import your redis client

const router = express.Router();

router.post('/', async (req, res) => {
  const { data } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = { message: `Resource created with data: ${data}`, id: uuidv4() };
    const responseToCache = { result, status: 201 };

    // Cache the response with expiration (e.g., 1 hour)
    await redisClient.set(
      idempotencyKey,
      JSON.stringify(responseToCache),
      'EX',
      3600
    );

    // Release the lock
    await redisClient.del(`lock:${idempotencyKey}`);

    res.status(201).json(result);
  } catch (error) {
    console.error('Resource creation error:', error);
    await redisClient.del(`lock:${idempotencyKey}`); // Release lock on error
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;