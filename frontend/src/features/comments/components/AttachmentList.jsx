import { Download, Eye, FileText, Image, FileSpreadsheet, FileArchive, File, Trash2, Paperclip, UserCircle2, Pencil } from 'lucide-react';
import { useState } from 'react';
import attachmentService from '../services/attachmentService';

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AVATAR_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const getAvatarColor = (id = '') => {
  if (!id) return AVATAR_COLORS[0];
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
};

const FILE_CONFIG = {
  'image/':                                                          { icon: Image,           color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  'application/pdf':                                                 { icon: FileText,         color: '#ef4444', bg: 'rgba(239,68,68,0.1)'    },
  'application/vnd.ms-excel':                                        { icon: FileSpreadsheet,  color: '#10b981', bg: 'rgba(16,185,129,0.1)'   },
  'application/vnd.openxmlformats-officedocument.spreadsheetml':    { icon: FileSpreadsheet,  color: '#10b981', bg: 'rgba(16,185,129,0.1)'   },
  'application/msword':                                              { icon: FileText,         color: '#2563eb', bg: 'rgba(37,99,235,0.1)'    },
  'application/vnd.openxmlformats-officedocument.wordprocessingml': { icon: FileText,         color: '#2563eb', bg: 'rgba(37,99,235,0.1)'    },
  'application/zip':                                                 { icon: FileArchive,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'   },
};

const getFileConfig = (mimeType = '') => {
  for (const [key, cfg] of Object.entries(FILE_CONFIG)) {
    if (mimeType.startsWith(key)) return cfg;
  }
  return { icon: File, color: 'var(--text-soft)', bg: 'rgba(148,163,184,0.1)' };
};

const AttachmentList = ({ attachments, onDelete, onDownload, onView, onRename, loading, resolveDisplayName, currentUserId, canDeleteAny }) => {
  const [renamingId, setRenamingId] = useState(null);
  const [name, setName] = useState('');
  if (loading && attachments.length === 0) {
    return (
      <div className="attach-skeletons">
        <div className="chat-skeleton left" style={{ height: 60, borderRadius: 12 }} />
        <div className="chat-skeleton left" style={{ height: 60, borderRadius: 12 }} />
      </div>
    );
  }

  if (!loading && attachments.length === 0) {
    return (
      <div className="attach-empty">
        <Paperclip size={32} strokeWidth={1.2} />
        <p>No attachments yet.</p>
        <span>Upload a file using the button below.</span>
      </div>
    );
  }

  return (
    <div className="attach-file-list">
      {attachments.map((attachment) => {
        const { icon: Icon, color, bg } = getFileConfig(attachment.mimeType);

        const uploaderName = attachment.uploaderName
          || (resolveDisplayName ? resolveDisplayName(attachment.uploadedBy) : null)
          || `User ${String(attachment.uploadedBy || '').slice(-4)}`;

        const avatarColor = getAvatarColor(String(attachment.uploadedBy || ''));

        const isOwner = Boolean(currentUserId)
          && Boolean(attachment.uploadedBy)
          && String(attachment.uploadedBy) === String(currentUserId);
        const canDelete = isOwner || canDeleteAny;

        return (
          <div key={attachment.id} className="attach-file-card">
            <div className="attach-file-icon" style={{ color, background: bg }}>
              <Icon size={20} strokeWidth={1.5} />
            </div>

            <div className="attach-file-info">
              {renamingId === attachment.id ? (
                <form className="attach-rename-form" onSubmit={(event) => {
                  event.preventDefault();
                  const nextName = name.trim();
                  if (!nextName) return;
                  onRename(attachment.id, nextName).then(() => setRenamingId(null)).catch(() => {});
                }}>
                  <input value={name} onChange={(event) => setName(event.target.value)} maxLength="255" autoFocus aria-label="Attachment file name" />
                  <button type="submit" className="attach-file-btn" title="Save rename">Save</button>
                </form>
              ) : (
                <span className="attach-file-name" title={attachment.originalFileName}>
                  {attachment.originalFileName}
                </span>
              )}
              <span className="attach-file-meta">
                {formatBytes(attachment.fileSize)} · {formatDate(attachment.createdAt)}
              </span>
              <span className="attach-uploader-row">
                <span className="attach-uploader-avatar" style={{ background: avatarColor }} title={uploaderName}>
                  <UserCircle2 size={10} strokeWidth={1.5} color="#fff" />
                </span>
                <span className="attach-uploader-name">{uploaderName}</span>
              </span>
            </div>

            <div className="attach-file-actions">
              {attachmentService.canViewAttachment(attachment) && (
                <button type="button" className="attach-file-btn" title="View" onClick={() => onView(attachment).catch(() => {})}>
                  <Eye size={15} />
                </button>
              )}
              <button type="button" className="attach-file-btn" title="Download" onClick={() => onDownload(attachment).catch(() => {})}>
                <Download size={15} />
              </button>
              {isOwner && renamingId !== attachment.id && (
                <button type="button" className="attach-file-btn" title="Rename" onClick={() => { setName(attachment.originalFileName); setRenamingId(attachment.id); }}>
                  <Pencil size={15} />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="attach-file-btn danger"
                  title="Delete"
                  onClick={() => {
                    if (window.confirm(`Delete "${attachment.originalFileName}"?`)) {
                      onDelete(attachment.id).catch(() => {});
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentList;
