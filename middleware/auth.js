const { verifyToken } = require("../service/auth");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCoookieValue = req.cookies[cookieName];
    if (!tokenCoookieValue) {
      return next();
    }

    try {
      const userPayload = verifyToken(tokenCoookieValue);
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}

const authenticate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  next();
};

module.exports = { checkForAuthenticationCookie, authenticate };
