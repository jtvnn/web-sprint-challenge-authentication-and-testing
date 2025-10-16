const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token is provided
  if (!authHeader) {
    return res.status(401).json("token required");
  }

  const token = authHeader;
  const secret = process.env.JWT_SECRET || 'shh';

  // Verify the token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json("token invalid");
    }
    
    // Add user info to request object
    req.decodedJwt = decoded;
    next();
  });
};
