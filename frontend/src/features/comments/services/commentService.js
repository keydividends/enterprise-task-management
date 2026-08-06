import axiosClient from '../../../api/axiosClient';

const listComments = async (taskId, params = {}) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}/comments`, { params });
  return data; // { data: [...], pagination }
};

const createComment = async (taskId, payload) => {
  const { data } = await axiosClient.post(`/tasks/${taskId}/comments`, payload);
  return data.data; // comment
};

const editComment = async (commentId, payload) => {
  const { data } = await axiosClient.patch(`/comments/${commentId}`, payload);
  return data.data; // comment
};

const deleteComment = async (commentId) => {
  const { data } = await axiosClient.delete(`/comments/${commentId}`);
  return data.data;
};

const commentService = { listComments, createComment, editComment, deleteComment };

export default commentService;
