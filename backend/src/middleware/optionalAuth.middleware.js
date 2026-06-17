import jwt from 'jsonwebtoken';

export default function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.get('Authorization');

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return next();
  }

  const token = parts[1];
  if (!token) return next();

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured for optional auth');
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (decoded && decoded.sub && decoded.username) {
      req.user = {
        id: decoded.sub,
        username: decoded.username,
      };
    }
  } catch (err) {
    // Invalid token — ignore and continue without setting req.user
  }

  return next();
}
