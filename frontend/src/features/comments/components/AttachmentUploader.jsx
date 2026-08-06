import { useRef, useState } from 'react';
import { Paperclip, X, CloudUpload } from 'lucide-react';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip',
];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type))
    return `Type "${file.type}" not allowed.`;
  if (file.size > MAX_SIZE_BYTES)
    return `Exceeds ${MAX_SIZE_MB} MB limit.`;
  return null;
};

const AttachmentUploader = ({ onUpload, uploading, uploadProgress }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setValidationError(err); setPendingFile(null); return; }
    setValidationError(null);
    setPendingFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    try {
      await onUpload(pendingFile);
      setPendingFile(null);
    } catch {
      // ignore
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="attach-uploader-bar">
      {validationError && (
        <div className="attach-error-row">
          <X size={12} />
          <span>{validationError}</span>
          <button type="button" onClick={() => setValidationError(null)}><X size={11} /></button>
        </div>
      )}

      {uploading && (
        <div className="attach-progress-row">
          <div className="attach-progress-track">
            <div className="attach-progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="attach-progress-label">{uploadProgress}%</span>
        </div>
      )}

      {pendingFile && !uploading && (
        <div className="attach-pending-row">
          <Paperclip size={13} />
          <span className="attach-pending-name" title={pendingFile.name}>{pendingFile.name}</span>
          <button
            type="button"
            className="attach-confirm-btn"
            onClick={handleConfirmUpload}
          >
            <CloudUpload size={14} /> Upload
          </button>
          <button
            type="button"
            className="attach-cancel-btn"
            onClick={() => setPendingFile(null)}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {!pendingFile && !uploading && (
        <div
          className={`attach-drop-bar ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Attach a file"
        >
          <Paperclip size={15} />
          <span>Attach a file</span>
          <span className="attach-drop-hint"> drag &amp; drop  [max {MAX_SIZE_MB} MB]</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
        disabled={uploading}
      />
    </div>
  );
};

export default AttachmentUploader;
