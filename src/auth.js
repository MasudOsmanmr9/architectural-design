const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { comparePasswords } = require('./utils/password');
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

/**
 * Generates a new access token for a given user by their userId.
 * 
 * This function retrieves the user from the database using the provided userId.
 * If the user is found, it generates a new secret token and stores it in the 
 * secretTokenService. A new access token is then created with the user's details 
 * and the secret token, which expires in 15 minutes.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Object>} An object containing the new access token.
 * @throws {Error} Throws an error if the user is not found.
 */


/**
 * Generates a new access token for a given user by their userId.
 * 
 * This function retrieves the user from the database using the provided userId.
 * If the user is found, it generates a new secret token and stores it in the 
 * secretTokenService. A new access token is then created with the user's details 
 * and the secret token, which expires in 15 minutes.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Object>} An object containing the new access token.
 * @throws {Error} Throws an error if the user is not found.
 */
async function refreshToken(userId) {
  const user = await users.findOne(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Generate a new secret token
  const secretToken = uuidv4();

  // Store the new secret token in the secretTokenService
  await secretTokenService.createSecretToken(secretToken, user.id);

  // Create a new access token with the user's details and the secret token
  const payload = { username: user.name, sub: user.id, token: secretToken };
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  // Return the new access token
  return { access_token };
}

module.exports = { newSignin, logout, refreshToken };