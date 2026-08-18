const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const roleController = require("./role.controller");

const router = express.Router();

// Role Routes
router.post(
  "/",
  authenticate,
  authorize("ROLE_CREATE"),
  roleController.createRole
);
router.get("/", authenticate, authorize("ROLE_VIEW"), roleController.listRoles);
router.get("/:roleId", authenticate, authorize("ROLE_VIEW"), roleController.getRoleById);
router.patch(
  "/:roleId",
  authenticate,
  authorize("ROLE_UPDATE"),
  roleController.updateRole
);
router.delete(
  "/:roleId",
  authenticate,
  authorize("ROLE_DELETE"),
  roleController.deleteRole
);

// Role Permissions Routes
router.get(
  "/:roleId/permissions",
  authenticate,
  authorize("ROLE_VIEW"),
  roleController.getRolePermissions
);
router.put(
  "/:roleId/permissions",
  authenticate,
  authorize("ROLE_UPDATE"),
  roleController.updateRolePermissions
);

module.exports = router;
