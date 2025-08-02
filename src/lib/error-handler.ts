/**
 * Firebase Error Handler Utility
 * Provides consistent error handling for Firebase operations
 */

export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

export class FirebaseErrorHandler {
  /**
   * Get user-friendly error message from Firebase error code
   */
  static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      // Authentication errors
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups for this site.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      case 'auth/invalid-credential':
        return 'Invalid credentials provided.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-token-expired':
        return 'Your session has expired. Please sign in again.';
      case 'auth/invalid-user-token':
        return 'Invalid session. Please sign in again.';
      case 'auth/user-mismatch':
        return 'User mismatch. Please sign in again.';
      case 'auth/credential-already-in-use':
        return 'This credential is already associated with another account.';
      case 'auth/operation-not-supported-in-this-environment':
        return 'This operation is not supported in your current environment.';
      case 'auth/timeout':
        return 'Operation timed out. Please try again.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/invalid-verification-id':
        return 'Invalid verification ID. Please try again.';
      case 'auth/missing-verification-code':
        return 'Verification code is required.';
      case 'auth/missing-verification-id':
        return 'Verification ID is required.';
      case 'auth/quota-exceeded':
        return 'Service quota exceeded. Please try again later.';
      case 'auth/app-not-authorized':
        return 'This app is not authorized to use Firebase Authentication.';
      case 'auth/invalid-app-credential':
        return 'Invalid app credential.';
      case 'auth/invalid-app-id':
        return 'Invalid app ID.';
      case 'auth/invalid-tenant-id':
        return 'Invalid tenant ID.';
      case 'auth/tenant-id-mismatch':
        return 'Tenant ID mismatch.';
      case 'auth/unsupported-persistence-type':
        return 'Unsupported persistence type.';
      case 'auth/invalid-persistence-type':
        return 'Invalid persistence type.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/invalid-recaptcha-token':
        return 'Invalid reCAPTCHA token.';
      case 'auth/missing-recaptcha-token':
        return 'reCAPTCHA token is required.';
      case 'auth/invalid-recaptcha-action':
        return 'Invalid reCAPTCHA action.';
      case 'auth/missing-recaptcha-action':
        return 'reCAPTCHA action is required.';
      case 'auth/invalid-recaptcha-score':
        return 'Invalid reCAPTCHA score.';
      case 'auth/missing-recaptcha-score':
        return 'reCAPTCHA score is required.';
      case 'auth/invalid-recaptcha-secret':
        return 'Invalid reCAPTCHA secret.';
      case 'auth/missing-recaptcha-secret':
        return 'reCAPTCHA secret is required.';
      case 'auth/invalid-recaptcha-response':
        return 'Invalid reCAPTCHA response.';
      case 'auth/missing-recaptcha-response':
        return 'reCAPTCHA response is required.';
      case 'auth/invalid-recaptcha-site-key':
        return 'Invalid reCAPTCHA site key.';
      case 'auth/missing-recaptcha-site-key':
        return 'reCAPTCHA site key is required.';
      case 'auth/invalid-recaptcha-version':
        return 'Invalid reCAPTCHA version.';
      case 'auth/missing-recaptcha-version':
        return 'reCAPTCHA version is required.';
      case 'auth/invalid-recaptcha-domain':
        return 'Invalid reCAPTCHA domain.';
      case 'auth/missing-recaptcha-domain':
        return 'reCAPTCHA domain is required.';
      case 'auth/invalid-recaptcha-size':
        return 'Invalid reCAPTCHA size.';
      case 'auth/missing-recaptcha-size':
        return 'reCAPTCHA size is required.';
      case 'auth/invalid-recaptcha-theme':
        return 'Invalid reCAPTCHA theme.';
      case 'auth/missing-recaptcha-theme':
        return 'reCAPTCHA theme is required.';
      case 'auth/invalid-recaptcha-type':
        return 'Invalid reCAPTCHA type.';
      case 'auth/missing-recaptcha-type':
        return 'reCAPTCHA type is required.';
      case 'auth/invalid-recaptcha-badge':
        return 'Invalid reCAPTCHA badge.';
      case 'auth/missing-recaptcha-badge':
        return 'reCAPTCHA badge is required.';
      case 'auth/invalid-recaptcha-language':
        return 'Invalid reCAPTCHA language.';
      case 'auth/missing-recaptcha-language':
        return 'reCAPTCHA language is required.';
      case 'auth/invalid-recaptcha-callback':
        return 'Invalid reCAPTCHA callback.';
      case 'auth/missing-recaptcha-callback':
        return 'reCAPTCHA callback is required.';
      case 'auth/invalid-recaptcha-expired-callback':
        return 'Invalid reCAPTCHA expired callback.';
      case 'auth/missing-recaptcha-expired-callback':
        return 'reCAPTCHA expired callback is required.';
      case 'auth/invalid-recaptcha-error-callback':
        return 'Invalid reCAPTCHA error callback.';
      case 'auth/missing-recaptcha-error-callback':
        return 'reCAPTCHA error callback is required.';
      case 'auth/invalid-recaptcha-success-callback':
        return 'Invalid reCAPTCHA success callback.';
      case 'auth/missing-recaptcha-success-callback':
        return 'reCAPTCHA success callback is required.';
      case 'auth/invalid-recaptcha-close-callback':
        return 'Invalid reCAPTCHA close callback.';
      case 'auth/missing-recaptcha-close-callback':
        return 'reCAPTCHA close callback is required.';
      case 'auth/invalid-recaptcha-open-callback':
        return 'Invalid reCAPTCHA open callback.';
      case 'auth/missing-recaptcha-open-callback':
        return 'reCAPTCHA open callback is required.';
      case 'auth/invalid-recaptcha-render-callback':
        return 'Invalid reCAPTCHA render callback.';
      case 'auth/missing-recaptcha-render-callback':
        return 'reCAPTCHA render callback is required.';
      case 'auth/invalid-recaptcha-reset-callback':
        return 'Invalid reCAPTCHA reset callback.';
      case 'auth/missing-recaptcha-reset-callback':
        return 'reCAPTCHA reset callback is required.';
      case 'auth/invalid-recaptcha-get-response-callback':
        return 'Invalid reCAPTCHA get response callback.';
      case 'auth/missing-recaptcha-get-response-callback':
        return 'reCAPTCHA get response callback is required.';
      case 'auth/invalid-recaptcha-execute-callback':
        return 'Invalid reCAPTCHA execute callback.';
      case 'auth/missing-recaptcha-execute-callback':
        return 'reCAPTCHA execute callback is required.';
      case 'auth/invalid-recaptcha-render-callback':
        return 'Invalid reCAPTCHA render callback.';
      case 'auth/missing-recaptcha-render-callback':
        return 'reCAPTCHA render callback is required.';
      case 'auth/invalid-recaptcha-reset-callback':
        return 'Invalid reCAPTCHA reset callback.';
      case 'auth/missing-recaptcha-reset-callback':
        return 'reCAPTCHA reset callback is required.';
      case 'auth/invalid-recaptcha-get-response-callback':
        return 'Invalid reCAPTCHA get response callback.';
      case 'auth/missing-recaptcha-get-response-callback':
        return 'reCAPTCHA get response callback is required.';
      case 'auth/invalid-recaptcha-execute-callback':
        return 'Invalid reCAPTCHA execute callback.';
      case 'auth/missing-recaptcha-execute-callback':
        return 'reCAPTCHA execute callback is required.';

      // Firestore errors
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unauthenticated':
        return 'You must be signed in to perform this action.';
      case 'not-found':
        return 'The requested resource was not found.';
      case 'already-exists':
        return 'The resource already exists.';
      case 'resource-exhausted':
        return 'Resource quota exceeded. Please try again later.';
      case 'failed-precondition':
        return 'The operation was rejected because the system is not in a state required for the operation\'s execution.';
      case 'aborted':
        return 'The operation was aborted.';
      case 'out-of-range':
        return 'The operation was attempted past the valid range.';
      case 'unimplemented':
        return 'The operation is not implemented or not supported/enabled.';
      case 'internal':
        return 'Internal errors. Please try again later.';
      case 'unavailable':
        return 'The service is currently unavailable. Please try again later.';
      case 'data-loss':
        return 'Unrecoverable data loss or corruption.';
      case 'deadline-exceeded':
        return 'The deadline expired before the operation could complete.';

      // Storage errors
      case 'storage/unauthorized':
        return 'You do not have permission to access this file.';
      case 'storage/canceled':
        return 'The upload was canceled.';
      case 'storage/unknown':
        return 'An unknown error occurred during file upload.';
      case 'storage/invalid-checksum':
        return 'The file checksum is invalid.';
      case 'storage/retry-limit-exceeded':
        return 'The maximum retry limit was exceeded.';
      case 'storage/invalid-format':
        return 'The file format is not supported.';
      case 'storage/invalid-event-name':
        return 'Invalid event name.';
      case 'storage/invalid-url':
        return 'Invalid URL provided.';
      case 'storage/invalid-argument':
        return 'Invalid argument provided.';
      case 'storage/no-default-bucket':
        return 'No default bucket configured.';
      case 'storage/cannot-slice-blob':
        return 'Cannot slice blob.';
      case 'storage/server-file-wrong-size':
        return 'Server file size does not match expected size.';

      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Handle Firebase error and return structured error object
   */
  static handleError(error: any): FirebaseError {
    console.error('Firebase Error:', error);

    const errorCode = error.code || 'unknown';
    const message = this.getErrorMessage(errorCode);
    
    return {
      code: errorCode,
      message,
      details: error.message || error.toString()
    };
  }

  /**
   * Check if error is a Firebase authentication error
   */
  static isAuthError(error: any): boolean {
    const authErrorCodes = [
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/invalid-email',
      'auth/too-many-requests',
      'auth/requires-recent-login',
      'auth/network-request-failed',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/popup-blocked',
      'auth/account-exists-with-different-credential',
      'auth/invalid-credential',
      'auth/operation-not-allowed',
      'auth/user-disabled',
      'auth/user-token-expired',
      'auth/invalid-user-token',
      'auth/user-mismatch',
      'auth/credential-already-in-use',
      'auth/operation-not-supported-in-this-environment',
      'auth/timeout',
      'auth/invalid-verification-code',
      'auth/invalid-verification-id',
      'auth/missing-verification-code',
      'auth/missing-verification-id',
      'auth/quota-exceeded',
      'auth/app-not-authorized',
      'auth/invalid-app-credential',
      'auth/invalid-app-id',
      'auth/invalid-tenant-id',
      'auth/tenant-id-mismatch',
      'auth/unsupported-persistence-type',
      'auth/invalid-persistence-type',
      'auth/invalid-phone-number',
      'auth/missing-phone-number',
      'auth/invalid-recaptcha-token',
      'auth/missing-recaptcha-token',
      'auth/invalid-recaptcha-action',
      'auth/missing-recaptcha-action',
      'auth/invalid-recaptcha-score',
      'auth/missing-recaptcha-score',
      'auth/invalid-recaptcha-secret',
      'auth/missing-recaptcha-secret',
      'auth/invalid-recaptcha-response',
      'auth/missing-recaptcha-response',
      'auth/invalid-recaptcha-site-key',
      'auth/missing-recaptcha-site-key',
      'auth/invalid-recaptcha-version',
      'auth/missing-recaptcha-version',
      'auth/invalid-recaptcha-domain',
      'auth/missing-recaptcha-domain',
      'auth/invalid-recaptcha-size',
      'auth/missing-recaptcha-size',
      'auth/invalid-recaptcha-theme',
      'auth/missing-recaptcha-theme',
      'auth/invalid-recaptcha-type',
      'auth/missing-recaptcha-type',
      'auth/invalid-recaptcha-badge',
      'auth/missing-recaptcha-badge',
      'auth/invalid-recaptcha-language',
      'auth/missing-recaptcha-language',
      'auth/invalid-recaptcha-callback',
      'auth/missing-recaptcha-callback',
      'auth/invalid-recaptcha-expired-callback',
      'auth/missing-recaptcha-expired-callback',
      'auth/invalid-recaptcha-error-callback',
      'auth/missing-recaptcha-error-callback',
      'auth/invalid-recaptcha-success-callback',
      'auth/missing-recaptcha-success-callback',
      'auth/invalid-recaptcha-close-callback',
      'auth/missing-recaptcha-close-callback',
      'auth/invalid-recaptcha-open-callback',
      'auth/missing-recaptcha-open-callback',
      'auth/invalid-recaptcha-render-callback',
      'auth/missing-recaptcha-render-callback',
      'auth/invalid-recaptcha-reset-callback',
      'auth/missing-recaptcha-reset-callback',
      'auth/invalid-recaptcha-get-response-callback',
      'auth/missing-recaptcha-get-response-callback',
      'auth/invalid-recaptcha-execute-callback',
      'auth/missing-recaptcha-execute-callback'
    ];

    return authErrorCodes.includes(error.code);
  }

  /**
   * Check if error is a Firestore error
   */
  static isFirestoreError(error: any): boolean {
    const firestoreErrorCodes = [
      'permission-denied',
      'unauthenticated',
      'not-found',
      'already-exists',
      'resource-exhausted',
      'failed-precondition',
      'aborted',
      'out-of-range',
      'unimplemented',
      'internal',
      'unavailable',
      'data-loss',
      'deadline-exceeded'
    ];

    return firestoreErrorCodes.includes(error.code);
  }

  /**
   * Check if error is a Storage error
   */
  static isStorageError(error: any): boolean {
    return error.code && error.code.startsWith('storage/');
  }

  /**
   * Log error with context
   */
  static logError(error: any, context: string = 'Firebase operation') {
    const errorInfo = this.handleError(error);
    console.error(`[${context}] Error:`, {
      code: errorInfo.code,
      message: errorInfo.message,
      details: errorInfo.details,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
} 