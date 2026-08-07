const express = require("express");
const userController = require("./user.controller");
const authenticate = require("../../middleware/authenticate");

const router = express.Router();

// Specific routes MUST come before parameterized :userId routes
router.get("/search", authenticate, userController.searchUsers);
router.get("/me/profile", authenticate, userController.getMyProfile);
router.put("/me/profile", authenticate, userController.updateMyProfile);
router.post("/me/avatar", authenticate, userController.uploadAvatar);
router.delete("/me/avatar", authenticate, userController.removeAvatar);
router.get("/lookup/:customId", authenticate, userController.getUserByCustomId);

// Collection routes
router.get("/", authenticate, userController.getUsers);
router.post("/", authenticate, userController.createUser);

// Individual User routes
router.get("/:userId", authenticate, userController.getUserById);
router.put("/:userId", authenticate, userController.updateUser);
router.patch("/:userId", authenticate, userController.updateUser);

// Status and Lifecycle routes
router.patch("/:userId/status", authenticate, userController.updateUserStatus);
router.patch("/:userId/deactivate", authenticate, userController.deactivateUser);
router.patch("/:userId/activate", authenticate, userController.activateUser);
router.delete("/:userId", authenticate, userController.deleteUser);
router.patch("/:userId/restore", authenticate, userController.restoreUser);

// User Detail sub-resources
router.get("/:userId/profile", authenticate, userController.getUserProfile);
router.get("/:userId/projects", authenticate, userController.getUserProjects);
router.get("/:userId/teams", authenticate, userController.getUserTeams);
router.get("/:userId/workload", authenticate, userController.getUserWorkload);

module.exports = router;
