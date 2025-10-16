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

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json("username and password required");
    }

    // Check if username already exists
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json("username taken");
    }

    // Hash the password (max 2^8 = 256 rounds, using 8 rounds)
    const rounds = 8;
    const hashedPassword = await bcrypt.hash(password, rounds);

    // Insert new user into database
    const [id] = await db('users').insert({
      username,
      password: hashedPassword
    });

    // Get the created user
    const newUser = await db('users').where({ id }).first();

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      password: newUser.password
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json("username and password required");
    }

    // Find user by username
    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(401).json("invalid credentials");
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("invalid credentials");
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      message: `welcome, ${user.username}`,
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
