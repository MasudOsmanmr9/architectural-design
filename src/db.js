const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH,
  entities: [__dirname + '/entities/*.js'],
  synchronize: true, // Auto-create tables (dev only)
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error initializing Data Source:', err);
  });

module.exports = AppDataSource;