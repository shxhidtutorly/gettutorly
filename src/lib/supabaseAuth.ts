
// USER PROFILE HELPERS - Updated to work with Clerk integration
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    // For Clerk integration, we store user data in a way that doesn't conflict with Supabase auth
    // Since we can't directly insert into the users table with Clerk IDs, we'll use a different approach
    console.log('Creating user profile for Clerk user:', userId);
    
    // Store user data in localStorage for now since we're using Clerk for auth
    const userProfile = {
      id: userId,
      ...userData,
      role: userData.role || "student",
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(userProfile));
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    // For Clerk integration, retrieve from localStorage
    console.log('Getting user profile for Clerk user:', userId);
    
    const stored = localStorage.getItem(`user_profile_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return a default profile if none exists
    const defaultProfile = {
      id: userId,
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
