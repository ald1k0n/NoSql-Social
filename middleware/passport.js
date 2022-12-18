const mongoose = require('mongoose');
const User = require('../db/userSchemas');

const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) token = req.cookies['token'];
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: 'socialNetwork'
}
module.exports = passport => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('login friends posts role _id')
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (e) {
        console.log(e);
      }
    })
  )
}