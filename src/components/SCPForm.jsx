// SCPForm.jsx
// A reusable modal form component that handles both Create and Update operations.
// When the existingSCP prop is passed, the form pre-fills all fields for editing.
// When no existingSCP prop is passed, the form renders as an empty Add New SCP form.
// Communicates directly with the Supabase REST API for insert and update operations.

import { useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client for REST API calls
import './SCPForm.css';

function SCPForm({ existingSCP, onSuccess, onCancel }) {

  // Initialises form state — pre-fills fields if editing an existing SCP
  // Uses optional chaining (?.) to safely access existingSCP properties
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

  // Tracks whether the form is currently submitting to Supabase
  const [loading, setLoading] = useState(false);

  // Stores any validation or API error messages to display to the user
  const [error, setError] = useState(null);

  // Generic change handler — updates the matching formData field using the input name attribute
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles form submission for both Create and Update operations
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default browser form submission behaviour
    setLoading(true);
    setError(null);

    // Client-side validation — ensures all required fields are filled before API call
    if (!formData.item || !formData.object_class || !formData.description || !formData.containment) {
      setError('Item, Object Class, Description and Containment are required.');
      setLoading(false);
      return;
    }

    let result;

    if (existingSCP) {
      // UPDATE operation — uses Supabase REST API PATCH method
      // Matches the record by its unique Supabase ID and updates all fields
      result = await supabase
        .from('scp')
        .update(formData)
        .eq('id', existingSCP.id);
    } else {
      // CREATE operation — uses Supabase REST API POST method
      // Inserts a new record into the scp table
      result = await supabase
        .from('scp')
        .insert([formData]);
    }

    if (result.error) {
      // Displays the Supabase error message if the API call fails
      setError(result.error.message);
    } else {
      // Calls the onSuccess handler in App.jsx which refreshes the SCP list
      // and shows the success toast notification
      onSuccess(
        existingSCP ? 'SCP entry updated successfully.' : 'New SCP entry added successfully.',
        existingSCP ? existingSCP.item : 'Home' // Navigate back to SCP page or Home after success
      );
    }

    setLoading(false);
  };

  return (
    // Full screen overlay that dims the background when the form is open
    <div className="form-overlay">
      <div className="form-container">

        {/* Form header — shows different title depending on Create or Update mode */}
        <div className="form-header">
          <h2 className="form-title">
            {existingSCP ? 'EDIT SCP ENTRY' : 'ADD NEW SCP ENTRY'}
          </h2>
          {/* Close button calls onCancel which hides the form without saving */}
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        {/* Conditionally renders error message if validation or API call fails */}
        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="scp-form">

          {/* First row — Item number and Object Class side by side */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item # *</label>
              {/* Item field is disabled when editing to prevent changing the SCP ID */}
              <input
                className="form-input"
                type="text"
                name="item"
                placeholder="e.g. SCP-999"
                value={formData.item}
                onChange={handleChange}
                disabled={!!existingSCP} // Locks the field when editing an existing SCP
              />
            </div>
            <div className="form-group">
              <label className="form-label">Object Class *</label>
              {/* Dropdown restricted to the five official SCP classification levels */}
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

          {/* Description textarea — required field */}
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

          {/* Containment procedures textarea — required field */}
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

          {/* Second row — Image URL and Tags side by side — both optional */}
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
              {/* Tags stored as comma-separated string e.g. safe,humanoid,sentient */}
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

          {/* Addendum textarea — optional field */}
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

          {/* References textarea — optional field */}
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

          {/* Form action buttons — Cancel closes without saving, Submit triggers handleSubmit */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              CANCEL
            </button>
            {/* Submit button disabled while loading to prevent duplicate submissions */}
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