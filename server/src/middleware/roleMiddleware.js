/**
 * Role-Based Access Control (RBAC) authorization middleware
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'staff', 'student')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to perform this operation. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

export default authorize;
