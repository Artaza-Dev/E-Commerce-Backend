const userModel = require("../models/user");
const addressModel = require("../models/address");

module.exports.createAddress = async (req, res) => {
  try {
    const { fullName, address, city, state, zip, country, phone } = req.body;

    if (
      !fullName ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !country ||
      !phone
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = await addressModel.create({
      fullName,
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
    e.error("Error creating address:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // agar user ke pass koi address nahi hai
    if (!user.addresses || user.addresses.length === 0) {
      return res
        .status(200)
        .json({ message: "No addresses found", addresses: [] });
    }

    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.deleteAddress = async (req, res) => {
  try {
    let user = req.user;
    let authUser = await userModel.findOne({_id: user._id});
    if(!authUser){
      return res.status(404).json({message: "User not found"})
    }
    
    let address = await addressModel.findOneAndDelete({_id: req.params.id})
    if(!address){
      return res.status(401).json({message: "Address does not exist"})
    }

    authUser.addresses = authUser.addresses.filter((ids)=> ids.toString() !== address._id.toString())
    await authUser.save()

    res.status(200).json({message: "Address deleted successfully"})

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
