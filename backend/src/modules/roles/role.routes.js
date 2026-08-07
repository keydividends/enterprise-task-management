const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const roleController = require("./role.controller");

const ensureAdmin = (req, res, next) => {
  if (req.user?.role === "ADMIN") {
    return next();
  }

  const error = new Error("Admin access required.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

const router = express.Router();

// Role Routes
router.post(
  "/",
  authenticate,
  ensureAdmin,
  roleController.createRole
);
router.get("/", authenticate, roleController.listRoles);
router.get("/:roleId", authenticate, roleController.getRoleById);
router.patch(
  "/:roleId",
  authenticate,
  ensureAdmin,
  roleController.updateRole
);
router.delete(
  "/:roleId",
  authenticate,
  ensureAdmin,
  roleController.deleteRole
);

// Role Permissions Routes
router.get(
  "/:roleId/permissions",
  authenticate,
  roleController.getRolePermissions
);
router.put(
  "/:roleId/permissions",
  authenticate,
  ensureAdmin,
  roleController.updateRolePermissions
);

module.exports = router;
