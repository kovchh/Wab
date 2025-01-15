const jwt = require("jsonwebtoken");
const JWT_WHITELIST = require("../models/Whitelist");
const { SECRET_KEY } = require("../config/index");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });
  console.log(token);
  console.log(SECRET_KEY);
  try {
    console.log(JWT_WHITELIST);
    const isWhitelisted = await JWT_WHITELIST.findOne({ token });
    if (!isWhitelisted)
      return res.status(403).json({ message: "Token not allowed" });

    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token", error });
  }
};

module.exports = { verifyToken };
