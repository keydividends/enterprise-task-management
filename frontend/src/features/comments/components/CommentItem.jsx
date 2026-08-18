import { useState } from 'react';
import { Edit2, Trash2, CornerUpLeft, Check, X, UserCircle2 } from 'lucide-react';

const MAX_COMMENT_LENGTH = 1000;

const formatTimestamp = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AVATAR_COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
];
const getAvatarColor = (id = '') => {
  if (!id) return AVATAR_COLORS[0];
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
};

const CommentItem = ({ comment, currentUserId, canManageAny, onUpdate, onDelete, onReply, resolveDisplayName }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const isMine = Boolean(currentUserId) && String(comment.authorId) === String(currentUserId);
  const canManage = isMine || canManageAny;

  const displayName = resolveDisplayName
    ? resolveDisplayName(comment.authorId, comment.authorName)
    : (comment.authorName || `User ${String(comment.authorId || '').slice(-4)}`);

  const avatarColor = getAvatarColor(String(comment.authorId || ''));

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === comment.text) { setEditing(false); return; }
    setSaving(true);
    setActionError(null);
    try {
      await onUpdate(comment.id, trimmed);
      setEditing(false);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not update this comment.');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    setActionError(null);
    try { await onDelete(comment.id); }
    catch (error) {
      setActionError(error.response?.data?.message || 'Could not delete this comment.');
      setDeleting(false);
    }
  };

  return (
    <div className={`ci-row${deleting ? ' ci-deleting' : ''}`}>
      {/* Avatar */}
      <div className="ci-avatar" style={{ background: avatarColor }} title={displayName}>
        <UserCircle2 size={16} strokeWidth={1.5} color="#fff" />
      </div>

      {/* Body */}
      <div className="ci-body">
        <div className="ci-header">
          <span className="ci-name">{displayName}</span>
          <span className="ci-time">{formatTimestamp(comment.createdAt)}</span>
          {comment.isEdited && <span className="ci-edited">edited</span>}
        </div>

        <div className="ci-bubble">
          {editing ? (
            <div className="ci-edit-form">
              <textarea
                className="ci-edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                autoFocus
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                  if (e.key === 'Escape') { setEditText(comment.text); setEditing(false); }
                }}
              />
              <div className="ci-edit-actions">
                <button type="button" className="ci-btn ci-btn-save" onClick={handleSaveEdit} disabled={saving}>
                  <Check size={12} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="ci-btn ci-btn-cancel" onClick={() => { setEditText(comment.text); setEditing(false); }} disabled={saving}>
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="ci-text">{comment.text}</p>
          )}
        </div>

        {!editing && (
          <div className="ci-actions">
            {onReply && (
              <button type="button" className="ci-action-btn" onClick={() => onReply(comment)}>
                <CornerUpLeft size={12} /> Reply
              </button>
            )}
            {canManage && (
              <>
                <button type="button" className="ci-action-btn" onClick={() => { setEditText(comment.text); setEditing(true); }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button type="button" className="ci-action-btn ci-action-danger" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
          </div>
        )}
        {actionError && <p className="ci-action-error" role="alert">{actionError}</p>}
      </div>
    </div>
  );
};

export default CommentItem;
