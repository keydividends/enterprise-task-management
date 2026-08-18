import { useEffect, useRef } from 'react';
import { Paperclip, RefreshCw } from 'lucide-react';
import useAttachments from '../hooks/useAttachments';
import AttachmentUploader from './AttachmentUploader';
import AttachmentList from './AttachmentList';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveDisplayName } from './collaborationUser';


const AttachmentsPanel = ({ taskId }) => {
  const MAX_ATTACHMENTS_PER_TASK = 15;
  const { user } = useAuth();
  const canManageAny = ['ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZATION_ADMIN'].includes(String(user?.role || '').toUpperCase());
  const {
    attachments, pagination, loading, uploading, uploadProgress, error,
    fetchAttachments, uploadFile, removeAttachment, downloadAttachment, viewAttachment, renameAttachment,
  } = useAttachments(taskId);

  const listRef = useRef(null);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (file, fileName) => {
    await uploadFile(file, fileName);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="attach-panel">
      <div className="chat-panel-header">
        <div className="chat-panel-title">
          <Paperclip size={16} />
          <span>Attachments</span>
          <span className="comments-count-badge" title={`Maximum ${MAX_ATTACHMENTS_PER_TASK} attachments per task`}>
            {pagination.totalItems}/{MAX_ATTACHMENTS_PER_TASK}
          </span>
        </div>
        <button
          type="button"
          className="chat-icon-btn"
          onClick={() => fetchAttachments()}
          title="Refresh"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="attach-list-area" ref={listRef}>
        {error && (
          <div className="chat-error-banner">
            {error}
            <button type="button" onClick={() => fetchAttachments()}>Retry</button>
          </div>
        )}
        <AttachmentList
          attachments={attachments}
          loading={loading}
          onDelete={removeAttachment}
          onDownload={downloadAttachment}
          onView={viewAttachment}
          onRename={renameAttachment}
          resolveDisplayName={resolveDisplayName}
          currentUserId={user?.id || null}
          canManageAny={canManageAny}
        />
      </div>

      <div className="attach-upload-footer">
        <AttachmentUploader
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          disabled={pagination.totalItems >= MAX_ATTACHMENTS_PER_TASK}
        />
      </div>
    </div>
  );
};

export default AttachmentsPanel;
