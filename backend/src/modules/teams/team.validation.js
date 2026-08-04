const validateTeamPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Request body is required.');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  if (!String(payload.name || '').trim()) {
    const error = new Error('Team name is required.');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateTeamPayload,
};
