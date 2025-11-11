const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const couponCodeModel = require("../models/coupon-code")
const userModel = require("../models/user")

router.post("/createcoupon", async (req, res) => {
  try {
    const { code, discountValue } = req.body;

    const newCoupon = await couponCodeModel.create({
      code: code.toUpperCase(),
      discountValue,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    // get all user who is registered
    const users = await userModel.find({}, "_id email coupons");

    for (let user of users) {
      const alreadyAssigned = user.coupons.some(
        (c) => c.coupon.toString() === newCoupon._id.toString()
      );
      if (!alreadyAssigned) {
        user.coupons.push({
          coupon: newCoupon._id,
          isUsed: false,
        });
        await user.save();
      }
    }

    res.json({
      message: `Coupon '${newCoupon.code}' created and assigned to ${users.length} users.`,
      coupon: newCoupon
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating coupon", error: error.message });
  }
});

router.get("/mycoupons", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("coupons.coupon")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/applycoupon", isLoggedIn, async (req, res) => {
  try {
    let users = req.user
    const { code } = req.body;

    const coupon = await couponCodeModel.findOne({ code: code.toUpperCase() });
    if (!coupon)
      return res.status(404).json({ message: "Invalid or inactive coupon" });

    const currentDate = new Date();
    if (currentDate > new Date(coupon.expiryDate)) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon expired" });
    }

    // Find user and check coupon usage
    const user = await userModel.findById({_id: users._id}).populate("coupons.coupon");

    if (!user) return res.status(404).json({ message: "User not found" });

    const userCoupon = user.coupons.find(
      (item) => item.coupon.code.toUpperCase() === code.toUpperCase()
    );

    if (!userCoupon)
      return res.status(403).json({ message: "This coupon is not assigned to you" });

    if (userCoupon.isUsed)
      return res.status(400).json({ message: "Coupon already used" });

    if (!coupon.isActive)
      return res.status(400).json({ message: "Coupon is not active" });

    const discount = coupon.discountValue;
    userCoupon.isUsed = true;
    await user.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying coupon", error: error.message });
  }
});




module.exports = router;
