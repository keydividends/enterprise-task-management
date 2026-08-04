const express = require("express");
const userController = require("./user.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

// Specific routes MUST come before parameterized :userId routes
router.get("/search", authenticate, userController.searchUsers);
router.get("/me/profile", authenticate, userController.getMyProfile);
router.put("/me/profile", authenticate, userController.updateMyProfile);
router.post("/me/avatar", authenticate, userController.uploadAvatar);
router.delete("/me/avatar", authenticate, userController.removeAvatar);

// Collection routes
router.get("/", authenticate, authorize("USER_VIEW"), userController.getUsers);
router.post("/", authenticate, authorize("USER_CREATE"), userController.createUser);

// Individual User routes
router.get("/:userId", authenticate, authorize("USER_VIEW"), userController.getUserById);
router.put("/:userId", authenticate, authorize("USER_UPDATE"), userController.updateUser);
router.patch("/:userId", authenticate, authorize("USER_UPDATE"), userController.updateUser);

// Status and Lifecycle routes
router.patch("/:userId/status", authenticate, authorize("USER_UPDATE"), userController.updateUserStatus);
router.patch("/:userId/deactivate", authenticate, authorize("USER_UPDATE"), userController.deactivateUser);
router.patch("/:userId/activate", authenticate, authorize("USER_UPDATE"), userController.activateUser);
router.delete("/:userId", authenticate, authorize("USER_DELETE"), userController.deleteUser);
router.patch("/:userId/restore", authenticate, authorize("USER_DELETE"), userController.restoreUser);

// User Detail sub-resources
router.get("/:userId/profile", authenticate, authorize("USER_VIEW"), userController.getUserProfile);
router.get("/:userId/projects", authenticate, authorize("USER_VIEW"), userController.getUserProjects);
router.get("/:userId/teams", authenticate, authorize("USER_VIEW"), userController.getUserTeams);
router.get("/:userId/workload", authenticate, authorize("USER_VIEW"), userController.getUserWorkload);

module.exports = router;
