const express = require('express');
const routes = require('./routes/routes');
const resourceRouter  = require('./routes/resourceRouter');
const bodyParser = require('body-parser');
require('dotenv').config();
const AppDataSource = require('./db');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('./redisClient');
const idempotencyMiddleware = require('./idempotencyMiddleware');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/', routes);
app.use('/resource', resourceRouter);
app.use(idempotencyMiddleware);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error initializing Data Source:', err);
  });


  process.on('SIGINT', () => {
    redisClient.quit(() => {
      console.log('Redis connection closed');
      process.exit();
    });
  });


  and i am also concern about server storage where idempotency key and its associated result is stored