const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const couponCodeModel = require("../models/coupon-code")
const userModel = require("../models/user")
const { checkRole } = require("../middlewares/roleBaseAccess");
const { createCoupon, myCoupons, applyCoupon } = require("../controllers/couponController");

router.post("/createcoupon",isLoggedIn , checkRole(['admin']), createCoupon);

router.get("/mycoupons", isLoggedIn, myCoupons);

router.post("/applycoupon", isLoggedIn, applyCoupon);

module.exports = router;
