const express = require("express");
const router = express.Router();

const { createAdmin, registerUser, loginUser, logoutUser } = require("../controllers/userController")
// register user
router.post("/createadmin", createAdmin);

// User Registration Route
router.post("/register", registerUser);

// User Login Route
router.post("/login", loginUser);

// User Logout Route
router.post("/logout", logoutUser)

module.exports = router;

