const bcrypt = require('bcrypt');

async function encodePassword(rawPassword) {
  return await bcrypt.hash(rawPassword, 10);
}

async function comparePasswords(rawPassword, hash) {
  return await bcrypt.compare(rawPassword, hash);
}

module.exports = { encodePassword, comparePasswords };