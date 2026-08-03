const errorHandler = (error, req, res, next) => {
  const statusCode = Number(error.statusCode) || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";

  const response = {
    success: false,
    code,
    message: error.message || "Something went wrong.",
  };

  if (error.field) {
    response.field = error.field;
  }

  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  if (statusCode >= 500) {
    console.error("Unhandled server error:", error);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
