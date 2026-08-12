import axiosClient from '../../../api/axiosClient';

const listAttachments = async (taskId, params = {}) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}/attachments`, { params });
  return data; // { data: [...], pagination }
};

const uploadAttachment = async (taskId, file, fileName, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName || file.name);

  // Do NOT set Content-Type manually — axios must auto-generate it with the
  // multipart boundary, otherwise multer on the backend cannot parse the body.
  const { data } = await axiosClient.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  });
  return data.data; // attachment
};

const downloadAttachment = async (attachment) => {
  const response = await axiosClient.get(`/attachments/${attachment.id}/download`, {
    responseType: 'blob',
  });
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = attachment.originalFileName || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

const canViewAttachment = (attachment) => {
  const mimeType = attachment?.mimeType || '';
  return mimeType === 'application/pdf'
    || mimeType === 'text/plain'
    || mimeType === 'text/csv'
    || mimeType.startsWith('image/');
};

const viewAttachment = async (attachment) => {
  // Open the tab before the request so browsers do not treat it as an
  // unsolicited popup. The request still goes through axios, which supplies
  // the bearer token required by the existing protected endpoint.
  const viewer = window.open('', '_blank');
  if (!viewer) throw new Error('Your browser blocked the preview window. Please allow popups and try again.');

  try {
    viewer.opener = null;
    viewer.document.title = attachment.originalFileName || 'Attachment preview';
    const response = await axiosClient.get(`/attachments/${attachment.id}/download`, {
      params: { disposition: 'inline' },
      responseType: 'blob',
    });
    const objectUrl = URL.createObjectURL(response.data);
    viewer.location.replace(objectUrl);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    viewer.close();
    throw error;
  }
};

const deleteAttachment = async (attachmentId) => {
  const { data } = await axiosClient.delete(`/attachments/${attachmentId}`);
  return data.data;
};

const renameAttachment = async (attachmentId, fileName) => {
  const { data } = await axiosClient.patch(`/attachments/${attachmentId}`, { fileName });
  return data.data;
};

const attachmentService = { listAttachments, uploadAttachment, downloadAttachment, viewAttachment, canViewAttachment, deleteAttachment, renameAttachment };

export default attachmentService;
