const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    venueId: { type: String, required: true },
    venueName: { type: String, required: true },
    venueImg: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    people: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    createdAtLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
