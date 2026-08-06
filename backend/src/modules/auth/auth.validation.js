const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createValidationError = (message, field = "general") => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  error.field = field;
  return error;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !emailPattern.test(String(email).trim())) {
    throw createValidationError("Email is required and must be valid.", "email");
  }

  if (!password || !String(password).trim()) {
    throw createValidationError("Password is required.", "password");
  }

  return true;
};

const validateRegisterInput = ({ firstName, lastName, email, password, confirmPassword }) => {
  if (!firstName || !String(firstName).trim()) {
    throw createValidationError("First name is required.", "firstName");
  }

  if (!lastName || !String(lastName).trim()) {
    throw createValidationError("Last name is required.", "lastName");
  }

  if (!email || !emailPattern.test(String(email).trim())) {
    throw createValidationError("Email is required and must be valid.", "email");
  }

  if (!password || !String(password).trim()) {
    throw createValidationError("Password is required.", "password");
  }

  if (!passwordPolicy.test(String(password))) {
    throw createValidationError("Password must be at least 8 characters and include letters, numbers, and symbols.", "password");
  }

  if (String(password) !== String(confirmPassword || "")) {
    throw createValidationError("Password confirmation does not match.", "confirmPassword");
  }

  return true;
};

const validateForgotPasswordInput = ({ email }) => {
  if (!email || !emailPattern.test(String(email).trim())) {
    throw createValidationError("Email is required and must be valid.", "email");
  }

  return true;
};

const validateResetPasswordInput = ({ token, newPassword, confirmPassword }) => {
  if (!token || !String(token).trim()) {
    throw createValidationError("Reset token is required.", "token");
  }

  if (!newPassword || !String(newPassword).trim()) {
    throw createValidationError("New password is required.", "newPassword");
  }

  if (!passwordPolicy.test(String(newPassword))) {
    throw createValidationError("Password must be at least 8 characters and include letters, numbers, and symbols.", "newPassword");
  }

  if (String(newPassword) !== String(confirmPassword || "")) {
    throw createValidationError("Password confirmation does not match.", "confirmPassword");
  }

  return true;
};

module.exports = {
  validateLoginInput,
  validateRegisterInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
};
