// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const token = bearerToken || req.header('x-auth-token');

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server auth configuration is missing' });
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded?.user?.id) {
      return res.status(401).json({ message: 'Token payload is invalid' });
    }

    const dbUser = await User.findById(decoded.user.id).select('role isActive');
    if (!dbUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (dbUser.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    req.user = {
      id: decoded.user.id,
      role: dbUser.role,
      isActive: dbUser.isActive,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};