const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    variants: [{
         variantId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant',},
    }      
    ],
})

module.exports = mongoose.model("Product", productSchema);