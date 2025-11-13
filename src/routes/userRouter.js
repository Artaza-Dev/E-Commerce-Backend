const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const { createAdmin, registerUser, loginUser, logoutUser, fetchMe } = require("../controllers/userController")
// register user
router.post("/createadmin", createAdmin);

// User Registration Route
router.post("/register", registerUser);

// User Login Route
router.post("/login", loginUser);

// User Logout Route
router.post("/logout", logoutUser)

router.get("/mydata", isLoggedIn, fetchMe);

module.exports = router;

