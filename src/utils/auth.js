export const requireAuth = () => {
  return true;
};

export const getCurrentUser = () => {
  return {
    fullName: 'Anonymous User'
  };
};
