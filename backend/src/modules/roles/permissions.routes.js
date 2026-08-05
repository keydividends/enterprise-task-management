const express = require("express");
const authenticate = require("../../middleware/authenticate");
const roleController = require("./role.controller");

const router = express.Router();

// Permissions Routes
router.get("/", authenticate, roleController.listPermissions);

module.exports = router;
