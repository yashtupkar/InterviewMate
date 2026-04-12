const express = require("express");
const router = express.Router();
const codingController = require("../controllers/codingController");
const { clerkAuth } = require("../middleware/auth");

router.post("/execute", clerkAuth, codingController.executeCode);

module.exports = router;
