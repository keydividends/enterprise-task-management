import { useEffect, useState } from 'react';

const ProjectForm = ({ initialValues = {}, onSubmit, onCancel, submitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    projectManagerId: '',
    startDate: '',
    targetEndDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      // This synchronizes form state when an asynchronously loaded project changes.
      setFormData({
        name: initialValues.name || '',
        key: initialValues.key || '',
        description: initialValues.description || '',
        status: initialValues.status || 'PLANNING',
        priority: initialValues.priority || 'MEDIUM',
        projectManagerId: initialValues.projectManagerCustomId || initialValues.projectManagerId || '',
        startDate: initialValues.startDate ? initialValues.startDate.slice(0, 10) : '',
        targetEndDate: initialValues.targetEndDate ? initialValues.targetEndDate.slice(0, 10) : '',
      });
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Project name is required.';
    if (!formData.key.trim()) nextErrors.key = 'Project key is required.';
    if (!formData.projectManagerId.trim()) nextErrors.projectManagerId = 'Project manager ID is required.';
    if (formData.targetEndDate && formData.startDate && new Date(formData.targetEndDate) < new Date(formData.startDate)) {
      nextErrors.targetEndDate = 'Target end date must be after the start date.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form className="auth-form project-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <span>Project name</span>
        <div className="input-wrap">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter project name" />
        </div>
        {errors.name && <span className="helper-copy" style={{ color: '#ef4444' }}>{errors.name}</span>}
      </div>

      <div className="field-group">
        <span>Project key</span>
        <div className="input-wrap">
          <input name="key" value={formData.key} onChange={handleChange} placeholder="ETMS" />
        </div>
        {errors.key && <span className="helper-copy" style={{ color: '#ef4444' }}>{errors.key}</span>}
      </div>

      <div className="field-group">
        <span>Description</span>
        <div className="input-wrap">
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Project description" rows="4" />
        </div>
      </div>

      <div className="field-group">
        <span>Status</span>
        <div className="input-wrap">
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <span>Priority</span>
        <div className="input-wrap">
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <span>Project manager ID or employee ID</span>
        <div className="input-wrap">
          <input name="projectManagerId" value={formData.projectManagerId} onChange={handleChange} placeholder="e.g. test-30" />
        </div>
        {errors.projectManagerId && <span className="helper-copy" style={{ color: '#ef4444' }}>{errors.projectManagerId}</span>}
      </div>

      <div className="field-group">
        <span>Start date</span>
        <div className="input-wrap">
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        </div>
      </div>

      <div className="field-group">
        <span>Target end date</span>
        <div className="input-wrap">
          <input type="date" name="targetEndDate" value={formData.targetEndDate} onChange={handleChange} />
        </div>
        {errors.targetEndDate && <span className="helper-copy" style={{ color: '#ef4444' }}>{errors.targetEndDate}</span>}
      </div>

      <div className="button-row" style={{ justifyContent: 'flex-end', gap: '12px' }}>
        {onCancel && (
          <button type="button" className="secondary-button compact" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-button compact" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
