import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["tops", "bottoms", "shoes", "accessories"],
      required: true
    },

    // New structured filter fields
    color: {
      type: String,
      enum: ["black", "white", "red", "blue"],
      default: null
    },

    pattern: {
      type: String,
      enum: ["plain", "striped", "checkered"],
      default: null
    },

    style: {
      type: String,
      enum: ["casual", "formal", "sporty"],
      default: null
    },

    imageUrl: {
      type: String,
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
