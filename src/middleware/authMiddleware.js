import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const [users] = await db.query(
        'SELECT id, name, email, phone FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request object
      req.user = users[0];
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware to verify session token (cookie-based)
export const verifySession = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session found, please login'
      });
    }

    // Check session in database
    const [sessions] = await db.query(
      `SELECT s.user_id, s.expires_at, u.id, u.name, u.email, u.phone 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );

    if (sessions.length === 0) {
      res.clearCookie('session_token');
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid, please login again'
      });
    }

    // Add user to request object
    req.user = {
      id: sessions[0].id,
      name: sessions[0].name,
      email: sessions[0].email,
      phone: sessions[0].phone
    };

    next();

  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware that accepts either JWT or Session
export const authenticate = async (req, res, next) => {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }

  // Fall back to session
  const sessionToken = req.cookies.session_token;
  if (sessionToken) {
    return verifySession(req, res, next);
  }

  // No authentication found
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

// Optional: Role-based access control
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user role from database
      const [users] = await db.query(
        'SELECT role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userRole = users[0].role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }

      next();

    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};