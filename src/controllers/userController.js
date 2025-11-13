const adminModel = require("../models/admin");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

module.exports.createAdmin = async function (req, res) {
  try {
    let { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let admin = await adminModel.find({ role: "admin" });
    console.log("Creating admin user", admin.length);
    if (admin.length > 0) {
      return res
        .status(504)
        .send("You don't have permission to create a new owner.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    let createOwner = await adminModel.create({
      username,
      role,
      email,
      password: hashpassword,
    });
    res.status(201).json({
      message: "Admin user created successfully",
      user: createOwner,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports.registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      let newUser = await userModel.create({
        username,
        email,
        password: hashPassword,
      });
      console.log(newUser.password);

      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log("req se pehla", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      let token = generateToken(user);
      if (result) {
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge:  7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: "Login successful", token, user });
      } else {
        res.status(400).json({ message: "Invalid email or password" });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports.logoutUser =  (req, res)=>{
    res.clearCookie("token");
    res.status(200).json({message: "Logout successful"});
}

module.exports.fetchMe = async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  res.status(200).json({ user });
}