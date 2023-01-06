const jwt = require('jsonwebtoken');

exports.cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;

  try {
    const user = jwt.verify(token, 'socialNetwork');
    req.user = user;
    next();
  } catch (e) {
    return res.status(404).json({ message: e });
  }
}

