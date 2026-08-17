import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareText, RefreshCw, Send, CornerDownLeft, UserCircle2 } from 'lucide-react';
import useComments from '../hooks/useComments';
import CommentItem from './CommentItem';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveDisplayName } from './collaborationUser';

const MAX_COMMENT_LENGTH = 1000;
const MAX_COMMENTS_PER_TASK = 30;

const buildThreads = (comments) => {
  const roots = [];
  const replyMap = {};
  comments.forEach((c) => {
    if (c.parentCommentId) {
      (replyMap[c.parentCommentId] = replyMap[c.parentCommentId] || []).push(c);
    } else {
      roots.push(c);
    }
  });
  return { roots, replyMap };
};

const CommentsPanel = ({ taskId }) => {
  const { user } = useAuth();
  const { comments, pagination, loading, error, fetchComments, addComment, updateComment, removeComment } = useComments(taskId);
  const currentUserId = user?.id || null;
  const canManageAny = ['ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZATION_ADMIN'].includes(String(user?.role || '').toUpperCase());

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // { id, authorLabel }

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const previousCountRef = useRef(0);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  useEffect(() => {
    const hasNewMessage = comments.length > previousCountRef.current;
    if (!loading && (previousCountRef.current === 0 || hasNewMessage)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    previousCountRef.current = comments.length;
  }, [comments, loading]);

  const { roots, replyMap } = useMemo(() => buildThreads(comments), [comments]);
  const isCommentLimitReached = pagination.totalItems >= MAX_COMMENTS_PER_TASK;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || isCommentLimitReached) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSendError(`Comments are limited to ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await addComment({ text: trimmed, ...(replyingTo ? { parentCommentId: replyingTo.id } : {}) });
      setText('');
      setReplyingTo(null);
    } catch (err) {
      setSendError(err.response?.data?.message || err.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const resizeTextarea = (element) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  };

  const handleReply = (comment) => {
    setReplyingTo({ id: comment.id, authorLabel: resolveDisplayName(comment.authorId, comment.authorName) });
    textareaRef.current?.focus();
  };

  return (
    <div className="cp-panel">
      <div className="chat-panel-header">
        <div className="chat-panel-title">
          <MessageSquareText size={16} />
          <span>Comments</span>
          <span className="comments-count-badge" title={`Maximum ${MAX_COMMENTS_PER_TASK} comments per task`}>
            {pagination.totalItems}/{MAX_COMMENTS_PER_TASK}
          </span>
        </div>
        <button type="button" className="chat-icon-btn" onClick={() => fetchComments()} title="Refresh" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="cp-timeline">
        {loading && comments.length === 0 && (
          <div className="chat-skeletons">
            <div className="chat-skeleton left" />
            <div className="chat-skeleton left medium" />
            <div className="chat-skeleton left" />
          </div>
        )}

        {error && (
          <div className="chat-error-banner">
            {error}
            <button type="button" onClick={() => fetchComments()}>Retry</button>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="chat-empty">
            <UserCircle2 size={40} strokeWidth={1.2} />
            <p>No comments yet.</p>
            <span>Be the first to comment below.</span>
          </div>
        )}

        {roots.map((comment) => (
          <div key={comment.id} className="cp-thread">
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              canManageAny={canManageAny}
              onUpdate={updateComment}
              onDelete={removeComment}
              onReply={handleReply}
              resolveDisplayName={resolveDisplayName}
            />

            {(replyMap[comment.id] || []).map((reply) => (
              <div key={reply.id} className="cp-reply-indent">
                <div className="cp-reply-quote">
                  <CornerDownLeft size={11} />
                  <span>Replying to <strong>{resolveDisplayName(comment.authorId, comment.authorName)}</strong></span>
                </div>
                <CommentItem
                  comment={reply}
                  currentUserId={currentUserId}
                  canManageAny={canManageAny}
                  onUpdate={updateComment}
                  onDelete={removeComment}
                  resolveDisplayName={resolveDisplayName}
                />
              </div>
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        {replyingTo && (
          <div className="chat-reply-strip">
            <CornerDownLeft size={13} />
            <span>Replying to <strong>{replyingTo.authorLabel}</strong></span>
            <button type="button" className="chat-reply-cancel" onClick={() => setReplyingTo(null)}>✕</button>
          </div>
        )}
        {sendError && <p className="chat-send-error">{sendError}</p>}
        {isCommentLimitReached && <p className="chat-send-error">Comment limit reached for this task.</p>}
        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder={isCommentLimitReached ? 'Comment limit reached for this task.' : (replyingTo ? `Reply to ${replyingTo.authorLabel}…` : 'Write a comment here… ')}
              value={text}
              onChange={(e) => { setText(e.target.value); resizeTextarea(e.target); }}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={sending || isCommentLimitReached}
            />
          </div>
          <button
            type="button"
            className={`chat-send-btn${text.trim() ? ' active' : ''}`}
            onClick={handleSend}
            disabled={sending || isCommentLimitReached || !text.trim()}
            title="Post comment (Enter)"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="chat-input-meta" aria-live="polite">
          <span></span>
          <span className={text.length >= MAX_COMMENT_LENGTH ? 'at-limit' : ''}>{text.length}/{MAX_COMMENT_LENGTH}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel;
