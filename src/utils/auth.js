export const requireAuth = () => {
  if (!window.Clerk?.user) {
    window.location.href = import.meta.env.VITE_CLERK_SIGN_IN_URL;
    return false;
  }
  return true;
};
