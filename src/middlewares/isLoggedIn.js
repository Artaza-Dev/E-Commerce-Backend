const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
// dotenv.config({ path: path.resolve(__dirname, "../../.env") });
module.exports = async function isLoggedIn(req, res, next) {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = await userModel.findOne({
      _id: decode.userId,
      email: decode.email,
    });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
