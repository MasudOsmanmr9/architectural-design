const redisClient = require('./redisClient');

module.exports = async (req, res, next) => {
  if (req.method !== 'POST') {
    return next(); // Only apply idempotency to POST requests
  }

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency key is required' });
  }

  try {
    const cachedResponse = await redisClient.get(idempotencyKey);
    if (cachedResponse) {
      const { result, status } = JSON.parse(cachedResponse);
      return res.status(status).json(result);
    }

    // Attempt to acquire a lock using Redis
    const lockKey = `lock:${idempotencyKey}`;
    const lockAcquired = await redisClient.set(lockKey, 'locked', 'NX', 'PX', 10000); // 10 seconds lock

    if (!lockAcquired) {
      return res.status(429).json({ error: 'Request is already being processed' }); // Resource Locked
    }

    req.idempotencyKey = idempotencyKey; // Make the key available for the route handler
    next();
  } catch (error) {
    console.error('Idempotency check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};