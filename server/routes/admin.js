const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/status", requireAuth, requireRole("admin"), (req, res) => {
  res.json({
    ok: true,
    message: "Админ эрхтэй хэрэглэгчийн хандалт амжилттай.",
  });
});

module.exports = router;
