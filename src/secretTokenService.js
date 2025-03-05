const AppDataSource = require('./db');
const SecretToken = require('./entities/SecretToken');

const secretTokenRepository = AppDataSource.getRepository(SecretToken);

async function createSecretToken(token, userId) {
  await secretTokenRepository.delete({ user_id: userId });
  const secret = secretTokenRepository.create({ token, user_id: userId });
  return await secretTokenRepository.save(secret);
}

async function findSecretToken(userId, token) {
  return secretTokenRepository.findOne({ where: { user_id: userId, token } });
}

async function deleteSecretToken(userId, token) {
  return secretTokenRepository.delete({ user_id: userId, token });
}

module.exports = { createSecretToken, findSecretToken, deleteSecretToken };