const express = require('express');
const auth = require('../auth');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.newSignin(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).send(err.message);
  }
});

router.post('/token', async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (payload.type !== 'refresh') return res.sendStatus(401);
    const result = await auth.refreshToken(payload.sub);
    res.json(result);
  } catch (err) {
    res.sendStatus(401);
  }
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected resource', user: req.user });
});