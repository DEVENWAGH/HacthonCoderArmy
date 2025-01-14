export const requireAuth = () => {
  if (!window.Clerk?.user) {
    // Clear any local data before redirecting
    sessionStorage.clear();
    localStorage.clear();
    
    // Use replace instead of href to prevent history stack issues
    window.location.replace(import.meta.env.VITE_CLERK_AFTER_SIGN_OUT_URL);
    return false;
  }
  return true;
};
