const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const { getAddresses, createAddress } = require("../controllers/addressController");

router.post("/createaddress", isLoggedIn,  createAddress);

router.get("/getaddresses", isLoggedIn, getAddresses);

module.exports = router;
