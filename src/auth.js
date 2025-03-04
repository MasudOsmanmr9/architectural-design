const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { comparePasswords } = require('./utils');
const users = require('./users');
const secretTokenService = require('./secretTokenService');
require('dotenv').config();

async function newSignin(email, password) {
  const [user] = await users.find(email);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatched = await comparePasswords(password, user.password);
  if (!isMatched) {
    throw new Error('Password mismatch');
  }

  const secretToken = uuidv4();
  await secretTokenService.createSecretToken(secretToken, user.id);

  const payload = { username: user.name, sub: user.id, token: secretToken };
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign({ sub: user.id, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  let { password: userPassword, ...rest } = user;
  return { ...rest, access_token, refresh_token };
}

async function logout(userId, token) {
  await secretTokenService.deleteSecretToken(userId, token);
  return { message: 'logout successfully' };
}

async function refreshToken(userId) {
  const user = await users.findOne(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const secretToken = uuidv4();
  await secretTokenService.createSecretToken(secretToken, user.id);

  const payload = { username: user.name, sub: user.id, token: secretToken };
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  return { access_token };
}

module.exports = { newSignin, logout, refreshToken };