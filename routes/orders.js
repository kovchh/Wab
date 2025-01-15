const express = require("express");
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { amount, title, status, items } = req.body;
    const userId = req.userId;

    const newOrder = new Order({ amount, title, userId, status, items });
    await newOrder.save();
    res.status(201).json({ message: "Order created!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, items, status } = req.body;
    const userId = req.userId;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== userId)
      return res.status(403).json({ message: "No access to edit this order" });

    order.title = title ?? order.title;
    order.items = items ?? order.items;
    order.status = status ?? order.status;

    await order.save();
    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== userId)
      return res
        .status(403)
        .json({ message: "No access to delete this order" });

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("items");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().populate("items");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const orders = await Order.find({ userId }).populate("items");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
