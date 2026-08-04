export const getNetWorkError = (error) => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};

export const getApiErrorField = (error) => error?.response?.data?.field || null;

export default { getNetWorkError, getApiErrorField };
