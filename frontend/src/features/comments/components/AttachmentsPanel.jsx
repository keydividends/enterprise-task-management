import { useEffect, useRef } from 'react';
import { Paperclip, RefreshCw } from 'lucide-react';
import useAttachments from '../hooks/useAttachments';
import AttachmentUploader from './AttachmentUploader';
import AttachmentList from './AttachmentList';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveDisplayName } from './collaborationUser';


const AttachmentsPanel = ({ taskId }) => {
  const { user } = useAuth();
  const {
    attachments, pagination, loading, uploading, uploadProgress, error,
    fetchAttachments, uploadFile, removeAttachment, getDownloadUrl,
  } = useAttachments(taskId);

  const listRef = useRef(null);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (file) => {
    await uploadFile(file);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="attach-panel">
      <div className="chat-panel-header">
        <div className="chat-panel-title">
          <Paperclip size={16} />
          <span>Attachments</span>
          {pagination.totalItems > 0 && (
            <span className="comments-count-badge">{pagination.totalItems}</span>
          )}
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
          getDownloadUrl={getDownloadUrl}
          resolveDisplayName={resolveDisplayName}
          currentUserId={user?.id || null}
        />
      </div>

      <div className="attach-upload-footer">
        <AttachmentUploader
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      </div>
    </div>
  );
};

export default AttachmentsPanel;
