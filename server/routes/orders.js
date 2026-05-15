const express = require("express");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

function serializeOrder(o) {
  return {
    id: String(o._id),
    venueId: o.venueId,
    venueName: o.venueName,
    venueImg: o.venueImg,
    date: o.date,
    time: o.time,
    people: o.people,
    note: o.note || "",
    status: o.status,
    createdAt: o.createdAtLabel || (o.createdAt && new Date(o.createdAt).toLocaleString("mn-MN")) || "",
  };
}

router.get("/", async (req, res) => {
  const list = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders: list.map(serializeOrder) });
});

router.post("/", async (req, res) => {
  try {
    const {
      venueId,
      venueName,
      venueImg = "",
      date,
      time,
      people,
      note = "",
    } = req.body || {};
    if (!venueId || !venueName || !date || !time) {
      return res.status(400).json({ error: "Захиалгын талбаруудыг бүрэн оруулна уу." });
    }
    const n = parseInt(people, 10);
    if (Number.isNaN(n) || n < 1) {
      return res.status(400).json({ error: "Хүний тоо зөв оруулна уу." });
    }
    const createdAtLabel = new Date().toLocaleString("mn-MN");
    const order = await Order.create({
      userId: req.user._id,
      venueId: String(venueId),
      venueName: String(venueName),
      venueImg: String(venueImg),
      date: String(date),
      time: String(time),
      people: n,
      note: String(note || ""),
      status: "confirmed",
      createdAtLabel,
    });
    res.status(201).json({ order: serializeOrder(order) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Серверийн алдаа." });
  }
});

router.patch("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Захиалга олдсонгүй." });
  }
  if (String(order.userId) !== String(req.user._id)) {
    return res.status(403).json({ error: "Өөрийн захиалгыг л өөрчилж болно." });
  }
  if (order.status !== "confirmed") {
    return res.status(403).json({ error: "Цуцлагдсан захиалгыг өөрчилж болохгүй." });
  }
  const { date, time } = req.body || {};
  if (date) order.date = String(date);
  if (time) order.time = String(time);
  await order.save();
  res.json({ order: serializeOrder(order) });
});

router.delete("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Захиалга олдсонгүй." });
  }
  if (String(order.userId) !== String(req.user._id)) {
    return res.status(403).json({ error: "Өөрийн захиалгыг л цуцалж болно." });
  }
  order.status = "cancelled";
  await order.save();
  res.json({ order: serializeOrder(order) });
});

module.exports = router;
