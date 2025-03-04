const redis = require('redis');

const redisClient = redis.createClient({
  // Configure your Redis connection details here
  host: '127.0.0.1', // Example: Redis server host
  port: 6379, // Example: Redis server port
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

module.exports = redisClient;