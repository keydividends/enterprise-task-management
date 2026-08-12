import { useCallback, useState } from 'react';
import attachmentService from '../services/attachmentService';

const useAttachments = (taskId) => {
  const [attachments, setAttachments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchAttachments = useCallback(async (params = {}) => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      // The API caps each response at 100 items, so collect every page to
      // preserve the complete attachment history instead of only the default 20.
      const pageSize = Math.min(Number(params.pageSize) || 100, 100);
      const firstPage = await attachmentService.listAttachments(taskId, { ...params, page: 1, pageSize });
      const totalPages = firstPage.pagination?.totalPages || 1;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          attachmentService.listAttachments(taskId, { ...params, page: index + 2, pageSize })
        )
      );
      const attachmentMap = new Map(
        [
          ...(firstPage.data || []),
          ...remainingPages.flatMap((page) => page.data || []),
        ].map((attachment) => [attachment.id, attachment])
      );
      setAttachments([...attachmentMap.values()].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      ));
      setPagination(firstPage.pagination || { page: 1, pageSize, totalItems: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const uploadFile = useCallback(async (file, fileName) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const attachment = await attachmentService.uploadAttachment(taskId, file, fileName, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      setAttachments((prev) => [attachment, ...prev]);
      setPagination((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
      return attachment;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed.';
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [taskId]);

  const removeAttachment = useCallback(async (attachmentId) => {
    setError(null);
    try {
      await attachmentService.deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not delete the attachment.');
      throw err;
    }
  }, []);

  const downloadAttachment = useCallback(async (attachment) => {
    setError(null);
    try {
      await attachmentService.downloadAttachment(attachment);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not download the attachment.';
      setError(msg);
      throw err;
    }
  }, []);

  const viewAttachment = useCallback(async (attachment) => {
    setError(null);
    try {
      await attachmentService.viewAttachment(attachment);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not open the attachment preview.';
      setError(msg);
      throw err;
    }
  }, []);

  const renameAttachment = useCallback(async (attachmentId, fileName) => {
    setError(null);
    try {
      const updated = await attachmentService.renameAttachment(attachmentId, fileName);
      setAttachments((previous) => previous.map((item) => item.id === attachmentId ? updated : item));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not rename the attachment.';
      setError(msg);
      throw err;
    }
  }, []);

  return {
    attachments, pagination, loading, uploading, uploadProgress, error,
    fetchAttachments, uploadFile, removeAttachment, downloadAttachment, viewAttachment, renameAttachment,
  };
};

export default useAttachments;
