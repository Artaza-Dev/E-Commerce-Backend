const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const userModel = require("../models/user");
const orderModel = require("../models/order")

router.post("/createorder", isLoggedIn, async (req, res) => {
  try {
    let user = req.user;
    let{ items } = req.body;
    let authUser = userModel.findOne({_id: user._id});
    if(!authUser){
        res.status(401).json({message: "Unauthorized User"})
    }
    
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
