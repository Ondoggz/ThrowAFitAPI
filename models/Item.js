import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  category: String, // e.g. tops, bottoms, shoes, etc.
  imageUrl: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
