import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './SCPForm.css';

// SCPForm handles both Create and Update operations
// When existingSCP prop is passed the form pre-fills for editing
// When no prop is passed the form is used for creating a new SCP
function SCPForm({ existingSCP, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    item: existingSCP?.item || '',
    object_class: existingSCP?.object_class || 'Euclid',
    description: existingSCP?.description || '',
    containment: existingSCP?.containment || '',
    image: existingSCP?.image || '',
    tags: existingSCP?.tags || '',
    addendum: existingSCP?.addendum || '',
    references: existingSCP?.references || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Updates form state whenever any field value changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validates required fields before sending to Supabase
    if (!formData.item || !formData.object_class || !formData.description || !formData.containment) {
      setError('Item, Object Class, Description and Containment are required.');
      setLoading(false);
      return;
    }

    let result;

    if (existingSCP) {
      // UPDATE — uses Supabase REST API PATCH method to update existing record
      result = await supabase
        .from('scp')
        .update(formData)
        .eq('id', existingSCP.id);
    } else {
      // CREATE — uses Supabase REST API POST method to insert new record
      result = await supabase
        .from('scp')
        .insert([formData]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSuccess(
        existingSCP ? 'SCP entry updated successfully.' : 'New SCP entry added successfully.',
        existingSCP ? existingSCP.item : 'Home'
      );
    }

    setLoading(false);
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">
            {existingSCP ? 'EDIT SCP ENTRY' : 'ADD NEW SCP ENTRY'}
          </h2>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="scp-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item # *</label>
              <input
                className="form-input"
                type="text"
                name="item"
                placeholder="e.g. SCP-999"
                value={formData.item}
                onChange={handleChange}
                disabled={!!existingSCP}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Object Class *</label>
              <select
                className="form-input"
                name="object_class"
                value={formData.object_class}
                onChange={handleChange}
              >
                <option value="Safe">Safe</option>
                <option value="Euclid">Euclid</option>
                <option value="Keter">Keter</option>
                <option value="Thaumiel">Thaumiel</option>
                <option value="Neutralized">Neutralized</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-input form-textarea"
              name="description"
              placeholder="Describe the SCP object..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Special Containment Procedures *</label>
            <textarea
              className="form-input form-textarea"
              name="containment"
              placeholder="Describe containment procedures..."
              value={formData.containment}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="form-input"
                type="text"
                name="image"
                placeholder="e.g. /scp-999.jpg"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                className="form-input"
                type="text"
                name="tags"
                placeholder="e.g. safe,humanoid,sentient"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Addendum</label>
            <textarea
              className="form-input form-textarea"
              name="addendum"
              placeholder="Optional addendum notes..."
              value={formData.addendum}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">References</label>
            <textarea
              className="form-input form-textarea"
              name="references"
              placeholder="Optional references..."
              value={formData.references}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              CANCEL
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'SAVING...' : existingSCP ? 'UPDATE ENTRY' : 'ADD ENTRY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SCPForm;