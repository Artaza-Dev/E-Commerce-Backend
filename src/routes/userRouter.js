const express = require("express");
const router = express.Router();

const { createAdmin, registerUser, loginUser } = require("../controllers/userController")
// register user
router.post("/createadmin", createAdmin);

// User Registration Route
router.post("/register", registerUser);

// User Login Route
router.post("/login", loginUser);

// User Logout Route
// router.post("/logout", (req, res)=>{
//     res.clearCookie("token");
//     res.status(200).json({message: "Logout successful"});
// })

module.exports = router;

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
