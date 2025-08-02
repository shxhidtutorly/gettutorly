import { auth } from './firebase';
import { getAuth, signInWithCustomToken } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Verify Firebase ID token from request headers
 * @param req - Express request object
 * @returns Promise<{ uid: string; email: string; role?: string } | null>
 */
export async function verifyFirebaseToken(req: any): Promise<{ uid: string; email: string; role?: string } | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return null;
    }

    // Verify the token using Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'student'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Middleware to require authentication for API routes
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function requireAuth(req: any, res: any, next: any) {
  try {
    const user = await verifyFirebaseToken(req);
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
}

/**
 * Middleware to require admin role
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function requireAdmin(req: any, res: any, next: any) {
  try {
    const user = await verifyFirebaseToken(req);
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
}

/**
 * Get user role from Firestore
 * @param uid - User ID
 * @returns Promise<string> - User role
 */
export async function getUserRole(uid: string): Promise<string> {
  try {
    const { getFirestore } = require('firebase-admin/firestore');
    const db = getFirestore();
    
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data()?.role || 'student';
    }
    return 'student';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'student';
  }
}

/**
 * Check if user has permission to access a resource
 * @param userUid - Current user's UID
 * @param resourceUserId - Resource owner's UID
 * @param userRole - Current user's role
 * @returns boolean - Whether user has permission
 */
export function hasPermission(userUid: string, resourceUserId: string, userRole: string): boolean {
  return userUid === resourceUserId || userRole === 'admin';
}

/**
 * Validate user input for security
 * @param input - User input to validate
 * @returns boolean - Whether input is valid
 */
export function validateUserInput(input: any): boolean {
  if (!input || typeof input !== 'object') {
    return false;
  }
  
  // Add more validation rules as needed
  const maxLength = 1000;
  const allowedFields = ['name', 'email', 'gender', 'role', 'photoURL'];
  
  for (const [key, value] of Object.entries(input)) {
    if (!allowedFields.includes(key)) {
      return false;
    }
    
    if (typeof value === 'string' && value.length > maxLength) {
      return false;
    }
  }
  
  return true;
} 