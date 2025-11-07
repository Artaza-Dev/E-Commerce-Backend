const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");

router.post("/createaddress", isLoggedIn, async (req, res) => {
  try {
    const { email, address, city, state, zip, country, phone } = req.body;

    if (!email || !address || !city || !state || !zip || !country || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = await addressModel.create({
      email,
      address,
      city,
      state,
      zip,
      country,
      phone,
    });

    user.addresses.push(newAddress._id);
    await user.save();

    res.status(201).json({
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


module.exports = router;
