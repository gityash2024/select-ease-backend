const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

const isVendor = (req, res, next) => {
  if (!req.user.is_vendor) {
    return res.status(403).json({ error: 'Access denied. Vendor privileges required.' });
  }
  next();
};

module.exports = { isAdmin, isVendor }; 