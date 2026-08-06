import { useCallback, useState } from 'react';
import commentService from '../services/commentService';

const byCreatedAt = (first, second) =>
  new Date(first.createdAt || 0).getTime() - new Date(second.createdAt || 0).getTime();

const uniqueChronologicalComments = (items) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return [...byId.values()].sort(byCreatedAt);
};

const useComments = (taskId) => {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (params = {}) => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      // Request every page. The original implementation replaced the visible
      // conversation with page one after a refresh, which made older/newer
      // messages appear to disappear as soon as a new message was posted.
      const pageSize = Math.min(Number(params.pageSize) || 100, 100);
      const firstPage = await commentService.listComments(taskId, { ...params, page: 1, pageSize });
      const firstItems = firstPage.data || [];
      const totalPages = firstPage.pagination?.totalPages || 1;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          commentService.listComments(taskId, { ...params, page: index + 2, pageSize })
        )
      );
      const allItems = [
        ...firstItems,
        ...remainingPages.flatMap((result) => result.data || []),
      ];

      setComments(uniqueChronologicalComments(allItems));
      setPagination(firstPage.pagination || { page: 1, pageSize, totalItems: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // payload: { text, parentCommentId? }
  const addComment = useCallback(async (payload) => {
    const comment = await commentService.createComment(taskId, payload);
    // Keep an optimistic post in the same stable chronological order as a refresh.
    setComments((prev) => uniqueChronologicalComments([...prev, comment]));
    setPagination((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
    return comment;
  }, [taskId]);

  const updateComment = useCallback(async (commentId, text) => {
    const updated = await commentService.editComment(commentId, { text });
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    return updated;
  }, []);

  const removeComment = useCallback(async (commentId) => {
    await commentService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
  }, []);

  return { comments, pagination, loading, error, fetchComments, addComment, updateComment, removeComment };
};

export default useComments;
