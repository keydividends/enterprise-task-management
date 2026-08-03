const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    code: "RESOURCE_NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFoundHandler;
