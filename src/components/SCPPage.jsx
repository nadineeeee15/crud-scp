
// Renders the full document view for an individual SCP entry.
// Displays all fields fetched from Supabase including containment procedures,
// description, tags, image, addendum and references.
// Also handles the Edit and Delete CRUD operations for each SCP entry.
// Includes a page reveal animation on load and a scroll reveal effect for sections.
// Previous and Next navigation arrows allow users to browse between SCP entries.

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client for DELETE operation
import SCPForm from './SCPForm';              // Reusable form for Edit operation
import './SCPPage.css';

// Maps object class names to their corresponding colour codes for visual styling
const classColors = {
  Safe: '#1a8a2a',
  Euclid: '#8a6a1a',
  Keter: '#8a1a1a',
};

function SCPPage({ scp, onSuccess, onDelete, onNavigate, scpList }) {
  // Controls the page fade-in animation — false hides the page, true shows it
  const [visible, setVisible] = useState(false);

  // Controls whether the Edit form modal is displayed
  const [showEditForm, setShowEditForm] = useState(false);

  // Controls whether the Delete confirmation dialog is displayed
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tracks whether a delete operation is in progress to disable the confirm button
  const [deleting, setDeleting] = useState(false);

  // Runs every time the scp prop changes — triggers when navigating between SCP pages
  useEffect(() => {
    // Instantly scrolls to top so users always start from the beginning of the new page
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Resets all UI states when navigating to a different SCP
    setVisible(false);
    setShowEditForm(false);
    setShowDeleteConfirm(false);

    // Delays the reveal animation slightly to allow the scroll to complete first
    const timer = setTimeout(() => {
      setVisible(true); // Triggers the page fade-in and slide-up animation

      // IntersectionObserver watches for elements with the reveal class entering the viewport
      // When an element is visible enough it adds the visible class to trigger its CSS animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Triggers the fade-in slide-up animation
          }
        });
      }, {
        threshold: 0.1,                    // Element must be 10% visible before triggering
        rootMargin: '0px 0px -50px 0px'   // Triggers 50px before the element reaches the bottom
      });

      // Resets any previously visible elements and starts observing all reveal elements
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible'); // Removes visible class from previous SCP page
        observer.observe(el);
      });

      // Cleanup disconnects the observer when the component re-renders or unmounts
      return () => observer.disconnect();
    }, 600); // 600ms delay gives time for the scroll and page transition to complete

    // Cleanup cancels the timer if the user navigates away before it fires
    return () => clearTimeout(timer);
  }, [scp]); // Re-runs whenever the scp prop changes

  // Handles the Delete operation — calls Supabase REST API DELETE method
  const handleDelete = async () => {
    setDeleting(true); // Disables the confirm button to prevent duplicate requests
    const { error } = await supabase
      .from('scp')
      .delete()
      .eq('id', scp.id); // Matches the record by its unique Supabase ID

    if (error) {
      // Shows a browser alert if the API call fails
      alert('Failed to delete: ' + error.message);
      setDeleting(false);
    } else {
      // Calls the onDelete handler in App.jsx which refreshes the list and navigates home
      onDelete();
    }
  };

  // Shows a fallback message if the SCP data could not be found
  if (!scp) return <div className="scp-not-found">FILE NOT FOUND</div>;

  // Looks up the colour code for the current object class — defaults to grey if unknown
  const classColor = classColors[scp.object_class] || '#8a7a64';

  // Applies the correct CSS class based on page visibility state for the transition animation
  const pageClass = visible ? 'scp-page page-visible' : 'scp-page page-hidden';

  // Parses the comma-separated tags string from Supabase into an array for rendering
  const tagsArray = scp.tags ? scp.tags.split(',').map(t => t.trim()) : [];

  // Parses the addendum field — handles both arrays and newline-separated strings
  // Supports both single and double line breaks as separators
  const addendumArray = scp.addendum
    ? (Array.isArray(scp.addendum) ? scp.addendum : scp.addendum.split(/\n\n|\n/).filter(a => a.trim()))
    : [];

  // Parses the references field — handles both arrays and double-newline-separated strings
  const referencesArray = scp.references
    ? (Array.isArray(scp.references) ? scp.references : scp.references.split('\n\n').filter(r => r.trim()))
    : [];

  // Calculates previous and next SCP entries for the navigation arrows
  // Only runs when scpList is available and has more than one entry
  const currentIndex = scpList ? scpList.findIndex(s => s.item === scp.item) : -1;
  // Wraps around to the last entry if currently on the first
  const prevSCP = scpList && currentIndex > -1 ? (scpList[currentIndex - 1] || scpList[scpList.length - 1]) : null;
  // Wraps around to the first entry if currently on the last
  const nextSCP = scpList && currentIndex > -1 ? (scpList[currentIndex + 1] || scpList[0]) : null;

  return (
    // Page class toggles between page-hidden and page-visible for the entrance animation
    <div className={pageClass} data-testid="scp-page">
      <div className="scp-bg" />         {/* Dark background image */}
      <div className="scp-bg-overlay" /> {/* Radial gradient overlay for depth */}
      <div className="scanlines" />      {/* CRT scanline visual effect */}

      {/* Edit form modal — only rendered when showEditForm is true
          Passes the current SCP data as existingSCP to pre-fill the form fields */}
      {showEditForm && (
        <SCPForm
          existingSCP={scp}
          onSuccess={onSuccess}                        // Refreshes list and shows success toast
          onCancel={() => setShowEditForm(false)}       // Closes form without saving
        />
      )}

      {/* Delete confirmation dialog — only rendered when showDeleteConfirm is true
          Requires explicit user confirmation before calling the Supabase DELETE API */}
      {showDeleteConfirm && (
        <div className="delete-overlay">
          <div className="delete-dialog">
            <h3 className="delete-title">CONFIRM DELETION</h3>
            <p className="delete-message">
              Are you sure you want to permanently delete <strong>{scp.item}</strong> from the database? This action cannot be undone.
            </p>
            <div className="delete-actions">
              {/* Cancel button closes the dialog without deleting */}
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                CANCEL
              </button>
              {/* Confirm button triggers the Supabase DELETE API call
                  Disabled while deletion is in progress to prevent duplicate requests */}
              <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scp-container">

        {/* Header section — reveals on scroll with fade-in animation */}
        <div className="scp-header reveal">
          <div className="scp-header-inner">
            {/* Item number display e.g. SCP-002 */}
            <div className="scp-id-block">
              <span className="scp-id-label">ITEM #</span>
              <span className="scp-id" data-testid="scp-id">{scp.item}</span>
            </div>
            {/* Object class display — colour changes based on classColors map above */}
            <div className="scp-class-block" style={{ '--class-color': classColor }}>
              <span className="scp-class-label">OBJECT CLASS</span>
              <span className="scp-class" data-testid="scp-class">{scp.object_class}</span>
            </div>
          </div>

          {/* Edit and Delete buttons — open modal or dialog when clicked */}
          <div className="scp-actions">
            <button className="btn-edit" onClick={() => setShowEditForm(true)}>
              ✎ EDIT ENTRY
            </button>
            <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              ✕ DELETE ENTRY
            </button>
          </div>

          <div className="scp-header-line" /> {/* Decorative divider line */}
        </div>

        {/* Tags section — renders each tag as an individual badge element */}
        <div className="scp-tags reveal" data-testid="scp-tags">
          {tagsArray.map(tag => (
            <span key={tag} className="scp-tag">{tag}</span>
          ))}
        </div>

        {/* Image section — only renders if an image path is stored in Supabase */}
        {scp.image && (
          <div className="scp-image-wrapper reveal" data-testid="scp-image">
            <img src={scp.image} alt={'Photograph of ' + scp.item} className="scp-image" />
            <span className="scp-image-caption">FILE PHOTO -- {scp.item}</span>
          </div>
        )}

        {/* Special Containment Procedures section
            Splits text by double newlines to render each paragraph separately */}
        <section className="scp-section reveal" data-testid="scp-containment">
          <h2 className="scp-section-title">
            <span className="section-marker">&#9612;</span>
            Special Containment Procedures
          </h2>
          <div className="scp-section-body">
            {scp.containment.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Description section — same paragraph splitting logic as containment */}
        <section className="scp-section reveal" data-testid="scp-description">
          <h2 className="scp-section-title">
            <span className="section-marker">&#9612;</span>
            Description
          </h2>
          <div className="scp-section-body">
            {scp.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Addendum section — only renders if addendumArray has entries
            No reveal class here as short pages cause it to stay hidden */}
        {addendumArray.length > 0 && (
          <section className="scp-section" data-testid="scp-addendum">
            <h2 className="scp-section-title">
              <span className="section-marker">&#9612;</span>
              Addendum
            </h2>
            <div className="scp-section-body">
              {/* Labels each entry sequentially e.g. Addendum SCP-003-A, SCP-003-B */}
              {addendumArray.map((entry, i) => (
                <div key={i} className="addendum-entry">
                  <span className="addendum-label">
                    Addendum {scp.item}-{String.fromCharCode(65 + i)}: {/* 65 = ASCII 'A' */}
                  </span>
                  <p>{entry}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* References section — only renders if referencesArray has entries */}
        {referencesArray.length > 0 && (
          <section className="scp-section" data-testid="scp-references">
            <h2 className="scp-section-title">
              <span className="section-marker">&#9612;</span>
              References
            </h2>
            <div className="scp-section-body">
              {/* Numbers each reference entry sequentially e.g. [1], [2] */}
              {referencesArray.map((ref, i) => (
                <div key={i} className="reference-entry">
                  <span className="reference-number">[{i + 1}]</span>
                  <p>{ref}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Document footer — shows item number, clearance level and foundation label
            Clearance level determined by object class: Keter=4, Euclid=3, Safe=2 */}
        <div className="scp-doc-footer reveal">
          <span>DOCUMENT {scp.item}</span>
          <span>CLEARANCE LEVEL: {scp.object_class === 'Keter' ? '4' : scp.object_class === 'Euclid' ? '3' : '2'}</span>
          <span>SCP FOUNDATION -- INTERNAL DOCUMENT</span>
        </div>

      </div>

      {/* Previous and Next navigation arrows fixed to the bottom right corner
          Allows users to browse through all SCP entries without returning to the homepage
          Wraps around — going back from the first SCP shows the last and vice versa */}
      {prevSCP && nextSCP && (
        <div className="scp-nav-arrows">
          {/* Previous arrow — navigates to the previous SCP in the list */}
          <button
            className="scp-nav-btn"
            onClick={() => onNavigate(prevSCP.item)}
            title={'Previous: ' + prevSCP.item}
          >
            <span className="arrow-icon">&#8592;</span>
            <span className="arrow-label">{prevSCP.item}</span>
          </button>
          {/* Next arrow — navigates to the next SCP in the list */}
          <button
            className="scp-nav-btn"
            onClick={() => onNavigate(nextSCP.item)}
            title={'Next: ' + nextSCP.item}
          >
            <span className="arrow-label">{nextSCP.item}</span>
            <span className="arrow-icon">&#8594;</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default SCPPage;