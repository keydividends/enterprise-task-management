const express = require("express");
const authController = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getMe);
router.get("/permissions", authenticate, authController.getPermissions);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh", authController.refresh);

module.exports = router;
