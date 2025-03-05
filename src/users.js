const AppDataSource = require('./db');
const User = require('./entities/User');

const userRepository = AppDataSource.getRepository(User);

async function find(email) {
  return userRepository.find({ where: { email } });
}

async function findOne(id) {
  return userRepository.findOne({ where: { id } });
}

module.exports = { find, findOne };