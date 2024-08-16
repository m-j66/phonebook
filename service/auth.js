const JWT = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

function createTokenForUser(User) {
  try {
    const payload = {
      id: User._id,
      email: User.email,
    };

    const token = JWT.sign(payload, secretKey, { expiresIn: "24h" });

    return token;
  } catch (error) {
    console.log("Error creating the token", error);
  }
}

function verifyToken(token) {
  try {
    const payload = JWT.verify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Error verifying token:", err);
  }
}

module.exports = {
  createTokenForUser,
  verifyToken,
};
