// src/middlewares/roleMiddleware.js
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
