// src/lib/firebase-auth-utils.js
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Verify Firebase ID token from request headers
 * @param {Object} req - Express request object
 * @returns {Promise<Object|null>} - Decoded token or null if invalid
 */
export async function verifyFirebaseToken(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header or invalid format');
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      console.log('❌ No token found in authorization header');
      return null;
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Token verified for user:', decodedToken.uid);
    
    return decodedToken;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
}

/**
 * Middleware to require authentication
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler with authentication
 */
export function requireAuth(handler) {
  return async (req, res) => {
    const user = await verifyFirebaseToken(req);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }
    
    // Add user to request object
    req.user = user;
    
    return handler(req, res);
  };
}

/**
 * Middleware to require admin role
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler with admin check
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    const user = await verifyFirebaseToken(req);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }
    
    // Check if user has admin role (you can implement your own admin check logic)
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
    }
    
    req.user = user;
    return handler(req, res);
  };
}

/**
 * Check if user has specific permission
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} - Whether user has permission
 */
export async function hasPermission(userId, permission) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return false;
    }
    
    // Check for admin role
    if (userData.role === 'admin') {
      return true;
    }
    
    // Check for specific permissions
    if (userData.permissions && userData.permissions.includes(permission)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Validate user input for security
 * @param {Object} input - Input object to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export function validateUserInput(input, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    
    if (rules.required && !value) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value && rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
