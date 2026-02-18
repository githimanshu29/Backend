import mongoose from "mongoose";

/*
==========================================================
ORDER SCHEMA (Swiggy Core)
----------------------------------------------------------
Each order belongs to a user (customer)
Tracks items, total price, status
==========================================================
*/

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // coming from auth-service, ref is a key to create relationship between curretn schema to other one
    },

    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
