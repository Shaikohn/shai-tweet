import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.get('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({ message: 'Internal server error' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded.sub || !decoded.username) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: decoded.sub,
      username: decoded.username,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
