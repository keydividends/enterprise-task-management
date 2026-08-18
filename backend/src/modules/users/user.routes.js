const express = require("express");
const userController = require("./user.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

const canSearchProjectMembers = (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (["SUPER_ADMIN", "ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "PROJECT_MANAGER"].includes(role) || req.user?.permissions?.includes("USER_VIEW")) return next();

  const error = new Error("Permission denied.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

// Specific routes MUST come before parameterized :userId routes
router.get("/search", authenticate, canSearchProjectMembers, userController.searchUsers);
router.get("/me/profile", authenticate, userController.getMyProfile);
router.put("/me/profile", authenticate, userController.updateMyProfile);
router.patch("/me/employee-id", authenticate, userController.updateMyEmployeeId);
router.post("/me/avatar", authenticate, userController.uploadAvatar);
router.delete("/me/avatar", authenticate, userController.removeAvatar);
router.get("/lookup/:employeeId", authenticate, authorize("USER_VIEW"), userController.getUserByEmployeeId);

// Collection routes
router.get("/", authenticate, authorize("USER_VIEW"), userController.getUsers);
router.post("/", authenticate, authorize("USER_CREATE"), userController.createUser);

// Individual User routes
router.get("/:userId", authenticate, authorize("USER_VIEW"), userController.getUserById);
router.put("/:userId", authenticate, authorize("USER_UPDATE"), userController.updateUser);
router.patch("/:userId", authenticate, authorize("USER_UPDATE"), userController.updateUser);

// Status and Lifecycle routes
router.patch("/:userId/status", authenticate, authorize("USER_UPDATE"), userController.updateUserStatus);
router.patch("/:userId/deactivate", authenticate, authorize("USER_DEACTIVATE"), userController.deactivateUser);
router.patch("/:userId/activate", authenticate, authorize("USER_ACTIVATE"), userController.activateUser);
router.delete("/:userId", authenticate, authorize("USER_DELETE"), userController.deleteUser);
router.patch("/:userId/restore", authenticate, authorize("USER_UPDATE"), userController.restoreUser);

// User Detail sub-resources
router.get("/:userId/profile", authenticate, authorize("USER_VIEW"), userController.getUserProfile);
router.get("/:userId/projects", authenticate, authorize("USER_VIEW"), userController.getUserProjects);
router.get("/:userId/teams", authenticate, authorize("USER_VIEW"), userController.getUserTeams);
router.get("/:userId/workload", authenticate, authorize("USER_VIEW"), userController.getUserWorkload);

module.exports = router;
