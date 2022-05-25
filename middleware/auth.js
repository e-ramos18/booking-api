const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from bearer token in header
    token = req.headers.authorization.split(' ')[1];
    req.token = token;
  } // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(
      res.status(401).json({
        auth: false,
        message: "Not authorized to access this route!"
      })
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.access_key_token);
    req.user = decoded.user;
    next();
  } catch (err) {
    return next(
      res.status(401).json({
        auth: false,
        message: "Not authorized to access this route!",
        error: err
      })
    );
  }
});
