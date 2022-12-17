const jwt = require('jsonwebtoken');

exports.cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;

  try {
    const user = jwt.verify(token, 'socialNetwork');
    req.user = user;
    next();
  } catch (e) {
    res.clearCookie("token");
    return res.json({ message: e });
  }
}

