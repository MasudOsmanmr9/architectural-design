const jwt = require('jsonwebtoken');
const secretTokenService = require('./secretTokenService');
const users = require('./users');
require('dotenv').config();

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const secretToken = await secretTokenService.findSecretToken(payload.sub, payload.token);
    if (!secretToken) return res.sendStatus(401);

    const userData = await users.findOne(payload.sub);
    req.user = { ...payload, role: userData.role };
    req.userdata = userData;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

module.exports = { authenticateToken };