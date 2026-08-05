const Joi = require("joi");

const createRoleSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Role name is required",
      "string.min": "Role name must be at least 3 characters",
      "string.max": "Role name must not exceed 100 characters",
    }),
  description: Joi.string().max(500).optional().allow(""),
  permissionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .default([]),
});

const updateRoleSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.min": "Role name must be at least 3 characters",
      "string.max": "Role name must not exceed 100 characters",
    }),
  description: Joi.string().max(500).optional().allow(""),
  permissionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  isActive: Joi.boolean().optional(),
});

const updateRolePermissionsSchema = Joi.object({
  permissionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .required()
    .messages({
      "array.base": "Permission IDs must be an array",
      "array.required": "Permission IDs are required",
    }),
});

const validateCreateRole = (data) => {
  return createRoleSchema.validate(data);
};

const validateUpdateRole = (data) => {
  return updateRoleSchema.validate(data);
};

const validateUpdateRolePermissions = (data) => {
  return updateRolePermissionsSchema.validate(data);
};

module.exports = {
  validateCreateRole,
  validateUpdateRole,
  validateUpdateRolePermissions,
};
