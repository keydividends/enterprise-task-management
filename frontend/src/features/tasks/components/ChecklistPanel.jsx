import { useState } from 'react';
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import taskService from '../services/taskService';

const ChecklistPanel = ({ taskId, checklists = [], onChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newItems, setNewItems] = useState({});
  const [adding, setAdding] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleRenameChecklist = async () => {
    const title = editTitle.trim();
    if (!title || !editingChecklistId) return;
    try {
      const updated = await taskService.updateChecklist(editingChecklistId, title);
      const next = checklists.map((cl) => (cl.id === editingChecklistId ? { ...cl, ...updated } : cl));
      setEditingChecklistId(null);
      setEditTitle('');
      if (onChange) onChange(next);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await taskService.deleteChecklist(checklistId);
      const next = checklists.filter((cl) => cl.id !== checklistId);
      if (onChange) onChange(next);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddChecklist = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const checklist = await taskService.createChecklist(taskId, title);
      setNewTitle('');
      if (onChange) onChange([...checklists, checklist]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = async (checklistId) => {
    const text = (newItems[checklistId] || '').trim();
    if (!text) return;
    try {
      const item = await taskService.addChecklistItem(checklistId, { text });
      const next = checklists.map((cl) =>
        cl.id === checklistId ? { ...cl, items: [...(cl.items || []), item] } : cl
      );
      setNewItems((prev) => ({ ...prev, [checklistId]: '' }));
      if (onChange) onChange(next);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleItem = async (checklistId, itemId) => {
    try {
      const updated = await taskService.completeChecklistItem(checklistId, itemId);
      const next = checklists.map((cl) =>
        cl.id === checklistId
          ? { ...cl, items: (cl.items || []).map((it) => (it.id === itemId ? updated : it)) }
          : cl
      );
      if (onChange) onChange(next);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (checklistId, itemId) => {
    try {
      await taskService.deleteChecklistItem(checklistId, itemId);
      const next = checklists.map((cl) =>
        cl.id === checklistId ? { ...cl, items: (cl.items || []).filter((it) => it.id !== itemId) } : cl
      );
      if (onChange) onChange(next);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="checklist-panel">
      <div className="panel-section-head">
        <h4>Checklists</h4>
        <button
          type="button"
          className="ghost-button compact"
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? 'Cancel' : '+ Add checklist'}
        </button>
      </div>

      {adding && (
        <div className="checklist-add-row">
          <input
            type="text"
            placeholder="Checklist title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
          />
          <button type="button" className="primary-button compact" onClick={handleAddChecklist}>
            <Plus size={15} /> Add
          </button>
        </div>
      )}

      {checklists.length === 0 && !adding && (
        <p className="empty-hint">No checklists yet. Add one to track completion steps.</p>
      )}

      {checklists.map((checklist) => {
        const items = checklist.items || [];
        const done = items.filter((it) => it.isCompleted).length;
        return (
          <div key={checklist.id} className="checklist-block">
            <div className="checklist-head">
              {editingChecklistId === checklist.id ? (
                <div className="checklist-rename-row">
                  <input
                    type="text"
                    value={editTitle}
                    autoFocus
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameChecklist();
                      if (e.key === 'Escape') setEditingChecklistId(null);
                    }}
                  />
                  <button type="button" className="primary-button compact" onClick={handleRenameChecklist}>
                    Save
                  </button>
                  <button type="button" className="ghost-button compact" onClick={() => setEditingChecklistId(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <strong>{checklist.title}</strong>
                  <span className="checklist-tools">
                    <span className="checklist-progress">{done}/{items.length}</span>
                    <button
                      type="button"
                      className="checklist-edit"
                      onClick={() => {
                        setEditingChecklistId(checklist.id);
                        setEditTitle(checklist.title);
                      }}
                      title="Rename checklist"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="checklist-delete"
                      onClick={() => handleDeleteChecklist(checklist.id)}
                      title="Delete checklist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </>
              )}
            </div>

            <div className="checklist-items">
              {items.map((item) => (
                <div key={item.id} className="checklist-item">
                  <button
                    type="button"
                    className="checklist-check"
                    onClick={() => handleToggleItem(checklist.id, item.id)}
                    title={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <span className={item.isCompleted ? 'checklist-item-text done' : 'checklist-item-text'}>
                    {item.text}
                  </span>
                  <button
                    type="button"
                    className="checklist-delete"
                    onClick={() => handleDeleteItem(checklist.id, item.id)}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="checklist-add-row">
              <input
                type="text"
                placeholder="Add an item..."
                value={newItems[checklist.id] || ''}
                onChange={(e) => setNewItems((prev) => ({ ...prev, [checklist.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(checklist.id)}
              />
              <button type="button" className="secondary-button compact" onClick={() => handleAddItem(checklist.id)}>
                <Plus size={15} /> Add item
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistPanel;
