"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

//token must be provided in the req headers in headers.authorization
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when the user must be admin to perform an action.
 *
 * If not, raises Unauthorized.
 */

function ensureIsAdmin(req, res, next){
  try {
    if (!res.locals.user.isAdmin) throw new UnauthorizedError();
    return next()
  } catch (error) {
    return next(error)
  }
}

/** Middleware to use when the user must be admin or the user of req.params to perform an action.
 *
 * If not, raises Unauthorized.
 */

function ensureIsAdminOrSpecUser(req,res,next){
  try {
    if (!res.locals.user.isAdmin && (res.locals.user.username !== req.params.username)) throw new UnauthorizedError();
    return next()
  } catch (error) {
    return next(error)
  }
}

/** Middleware to use when the user must be the user of req.params to perform an action.
 *
 * If not, raises Unauthorized.
 */

function ensureIsSpecUser(req,res,next){
  try {
    if (res.locals.user.username !== req.params.username) throw new UnauthorizedError();
    return next()
  } catch (error) {
    return next(error)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsAdminOrSpecUser,
  ensureIsSpecUser
};
