const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../apps/users/user.model');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  const token = (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) && req.headers.authorization.split(' ')[1]
  if(!token) return next(new ErrorResponse('Bu routega sorov yuborish uchun sizda token yo\'q', 401))

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    if (!req.user) return next(new ErrorResponse('Bunday foydalanuvchi toplimadi, iltimos qaytadan login qiling', 401))
    next()
  } catch (err) {
    return next(new ErrorResponse('Avtorizatsiya yo\'q', 401))
  }
})

// Grant access for specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new ErrorResponse(`Роль ${req.user.role} не имеет доступа на этот route`, 403));
    }
    next();
  };
};