import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const isOrganizer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'organizer' || req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden. Organizer access required.' });
    }
  });
};

export const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }
  });
};
