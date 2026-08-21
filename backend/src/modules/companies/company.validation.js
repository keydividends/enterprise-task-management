const Joi = require("joi");

const createValidationError = (message, details = []) => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  error.details = details;
  return error;
};

const createCompanySchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(120).required().messages({
    "string.empty": "Company name is required.",
    "string.min": "Company name must be at least 2 characters.",
    "string.max": "Company name cannot exceed 120 characters.",
    "any.required": "Company name is required.",
  }),
  name: Joi.string().trim().min(2).max(120).optional(),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters.",
    "any.required": "Password is required.",
  }),
  address: Joi.string().trim().min(3).max(300).required().messages({
    "string.empty": "Company address is required.",
    "string.min": "Address must be at least 3 characters.",
    "any.required": "Company address is required.",
  }),
  phoneNumber: Joi.string().trim().pattern(/^[+]?[\d\s().-]{7,25}$/).required().messages({
    "string.empty": "Phone number is required.",
    "string.pattern.base": "Please enter a valid phone number (7–15 digits).",
    "any.required": "Phone number is required.",
  }),
  phone: Joi.string().trim().pattern(/^[+]?[\d\s().-]{7,25}$/).optional(),
}).custom((value, helpers) => {
  const raw = value.phoneNumber || value.phone || "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return helpers.error("any.custom", { message: "Please enter a valid phone number (7–15 digits)." });
  }
  return value;
}, "phone digit count");

const validateCreateCompany = (payload) => {
  const { error, value } = createCompanySchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    throw createValidationError(error.details[0]?.message || "Invalid company data", error.details);
  }
  return {
    name: value.companyName || value.name,
    email: value.email.toLowerCase().trim(),
    password: value.password,
    address: value.address.trim(),
    phone: (value.phoneNumber || value.phone || "").trim(),
  };
};

module.exports = {
  validateCreateCompany,
  createValidationError,
};
