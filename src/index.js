const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
require('dotenv').config();
const AppDataSource = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/', routes);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error initializing Data Source:', err);
  });