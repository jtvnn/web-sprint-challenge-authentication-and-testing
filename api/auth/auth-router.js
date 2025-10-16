const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');

// Helper function to generate JWT token
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const secret = process.env.JWT_SECRET || 'shh';
  const options = {
    expiresIn: '1d',
  };
  return jwt.sign(payload, secret, options);
}

module.exports = router;
