const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");
// register user
if (process.env.NODE_ENV === "development") {
  router.post("/createadmin", async function (req, res) {
    try {
      let owner = await userModel.find({ role: "admin" });
      if (owner.length > 0) {
        return res
          .status(504)
          .send("You don't have permission to create a new owner.");
      }
      let { username, email, password, role } = req.body;
      console.log(req.body);
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      let createOwner = await userModel.create({
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
  });
}
// User Registration Route
router.post("/register", async (req, res) => {
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
});
// User Login Route
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
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
        res.cookie("token", token);
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
});
// User Logout Route
router.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.status(200).json({message: "Logout successful"});
})

// forgot password
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth:{
//         user: "hafizartaza5290@gmail.com",
//         pass: "irofpqnmswseejax"
//     },
//     tls:{
//         rejectUnauthorized: false
//     }
// })

// router.post("verifyemail", async(req,res)=>{
//     try {
//         let {email} = req.body;
//         if(!email){
//             return res.status(400).json({message: "Email is required"});
//         }
//         let user = await userModel.findOne({email});
//         if(!user){
//             return res.status(400).json({message: "User with this email does not exist"});
//         }
//         const otp = Math.floor(100000 + Math.random()* 900000).toString();
//         user.otp = otp;
//         user.otpExpiry = Date.now() + 2 * 60 * 1000;
//         await user.save()

//         await transporter.sendMail({
//             from: "hafizartaza5290@gmail.com",
//             to: email,
//             subject: "Password Reset OTP",
//             text: `Your OTP for password reset is ${otp}. It is valid for 2 minutes.`
//         })
//         res.status(200).json({message: "valid", id: user._id});
//     } catch (error) {
//         res.status(500).json({message: "Internal Server Error", error: error.message});
//     }
// })

module.exports = router;
