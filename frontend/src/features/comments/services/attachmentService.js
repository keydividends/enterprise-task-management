import axiosClient from '../../../api/axiosClient';

const listAttachments = async (taskId, params = {}) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}/attachments`, { params });
  return data; // { data: [...], pagination }
};

const uploadAttachment = async (taskId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  // Do NOT set Content-Type manually — axios must auto-generate it with the
  // multipart boundary, otherwise multer on the backend cannot parse the body.
  const { data } = await axiosClient.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  });
  return data.data; // attachment
};

// Returns a URL the browser can navigate to for download
const getDownloadUrl = (attachmentId) =>
  `${axiosClient.defaults.baseURL}/attachments/${attachmentId}/download`;

const deleteAttachment = async (attachmentId) => {
  const { data } = await axiosClient.delete(`/attachments/${attachmentId}`);
  return data.data;
};

const attachmentService = { listAttachments, uploadAttachment, getDownloadUrl, deleteAttachment };

export default attachmentService;
