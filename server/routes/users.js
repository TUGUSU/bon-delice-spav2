const express = require("express");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const emailRaw = String(req.body.email || "").trim().toLowerCase();

    if (!fullName) {
      return res.status(400).json({ error: "Овог нэрээ оруулна уу." });
    }

    if (emailRaw) {
      const other = await User.findOne({
        email: emailRaw,
        _id: { $ne: req.user._id },
      });
      if (other) {
        return res.status(409).json({ error: "Энэ и-мэйл өөр хэрэглэгч дээр бүртгэлтэй байна." });
      }
    }

    const update = emailRaw
      ? { $set: { fullName, email: emailRaw } }
      : { $set: { fullName }, $unset: { email: "" } };

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "Хэрэглэгч олдсонгүй." });
    }

    return res.json({
      user: {
        id: String(user._id),
        username: user.username,
        fullName: user.fullName,
        email: user.email || "",
        role: user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Энэ и-мэйл бүртгэлтэй байна." });
    }
    console.error(err);
    return res.status(500).json({ error: "Серверийн алдаа." });
  }
});

module.exports = router;
