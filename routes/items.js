const express = require("express");
const Item = require("../models/Item");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, items, status } = req.body;
    const userId = req.userId;

    const amount = await validateOrder(items);

    const newOrder = new Order({ title, items, userId, status, amount });
    await newOrder.save();
    res.status(201).json({ message: "Order created!", order: newOrder });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Order validation error", error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, available } = req.body;

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.price = price ?? item.price;
    item.name = name ?? item.name;
    item.available = available ?? item.available;

    await item.save();
    res.status(200).json({ message: "Item updated!", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();
    res.status(200).json({ message: "Item deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const items = await Item.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalItems = await Item.countDocuments();

    res.status(200).json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/below/:price", async (req, res) => {
  try {
    const { price } = req.params;

    const items = await Item.find({ price: { $lt: price } });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/available", async (req, res) => {
  try {
    const items = await Item.find({ available: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

const validateOrder = async (items) => {
  const itemDetails = await Item.find({ _id: { $in: items } });

  const unavailableItems = itemDetails.filter((item) => !item.available);
  if (unavailableItems.length > 0) {
    throw new Error(
      `Unavailable items: ${unavailableItems.map((i) => i.name).join(", ")}`
    );
  }

  const totalAmount = itemDetails.reduce((sum, item) => sum + item.price, 0);
  return totalAmount;
};

module.exports = router;
