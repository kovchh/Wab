const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    price: { type: Number, required: true },
    name: { type: String, required: true },
    available: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
