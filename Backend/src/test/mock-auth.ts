export const authenticate = () => {
  return (req, res, next) => {
    // Pretend user is always logged in
    req.isAuthenticated = () => true;
    req.user = { id: 1, type: 'customer', username: 'testuser' };
    next();
  };
};