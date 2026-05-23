import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import SCPForm from './SCPForm';
import './SCPPage.css';

const classColors = {
  Safe: '#1a8a2a',
  Euclid: '#8a6a1a',
  Keter: '#8a1a1a',
};

function SCPPage({ scp, onSuccess, onDelete, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Resets scroll to top and triggers page reveal animation on SCP change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setVisible(false);
    setShowEditForm(false);
    setShowDeleteConfirm(false);

    const timer = setTimeout(() => {
      setVisible(true);
      // Intersection Observer triggers reveal animation as user scrolls
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 600);

    return () => clearTimeout(timer);
  }, [scp]);

  // Handles delete — calls Supabase REST API DELETE method
  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from('scp')
      .delete()
      .eq('id', scp.id);

    if (error) {
      alert('Failed to delete: ' + error.message);
      setDeleting(false);
    } else {
      onDelete();
    }
  };

  if (!scp) return <div className="scp-not-found">FILE NOT FOUND</div>;

  const classColor = classColors[scp.object_class] || '#8a7a64';
  const pageClass = visible ? 'scp-page page-visible' : 'scp-page page-hidden';

  // Parses comma-separated tags string into array for rendering
  const tagsArray = scp.tags ? scp.tags.split(',').map(t => t.trim()) : [];

  // Parses addendum string into array split by double or single newlines
  const addendumArray = scp.addendum
    ? (Array.isArray(scp.addendum) ? scp.addendum : scp.addendum.split(/\n\n|\n/).filter(a => a.trim()))
    : [];

  // Parses references string into array split by double newlines
  const referencesArray = scp.references
    ? (Array.isArray(scp.references) ? scp.references : scp.references.split('\n\n').filter(r => r.trim()))
    : [];

  return (
    <div className={pageClass} data-testid="scp-page">
      <div className="scp-bg" />
      <div className="scp-bg-overlay" />
      <div className="scanlines" />

      {/* Edit form modal — shown when Edit button is clicked */}
      {showEditForm && (
        <SCPForm
          existingSCP={scp}
          onSuccess={onSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="delete-overlay">
          <div className="delete-dialog">
            <h3 className="delete-title">CONFIRM DELETION</h3>
            <p className="delete-message">
              Are you sure you want to permanently delete <strong>{scp.item}</strong> from the database? This action cannot be undone.
            </p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                CANCEL
              </button>
              <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scp-container">

        <div className="scp-header reveal">
          <div className="scp-header-inner">
            <div className="scp-id-block">
              <span className="scp-id-label">ITEM #</span>
              <span className="scp-id" data-testid="scp-id">{scp.item}</span>
            </div>
            <div className="scp-class-block" style={{ '--class-color': classColor }}>
              <span className="scp-class-label">OBJECT CLASS</span>
              <span className="scp-class" data-testid="scp-class">{scp.object_class}</span>
            </div>
          </div>

          {/* Edit and Delete action buttons */}
          <div className="scp-actions">
            <button className="btn-edit" onClick={() => setShowEditForm(true)}>
              ✎ EDIT ENTRY
            </button>
            <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              ✕ DELETE ENTRY
            </button>
          </div>

          <div className="scp-header-line" />
        </div>

        <div className="scp-tags reveal" data-testid="scp-tags">
          {tagsArray.map(tag => (
            <span key={tag} className="scp-tag">{tag}</span>
          ))}
        </div>

        {scp.image && (
          <div className="scp-image-wrapper reveal" data-testid="scp-image">
            <img src={scp.image} alt={'Photograph of ' + scp.item} className="scp-image" />
            <span className="scp-image-caption">FILE PHOTO -- {scp.item}</span>
          </div>
        )}

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

        {addendumArray.length > 0 && (
          <section className="scp-section" data-testid="scp-addendum">
            <h2 className="scp-section-title">
              <span className="section-marker">&#9612;</span>
              Addendum
            </h2>
            <div className="scp-section-body">
              {addendumArray.map((entry, i) => (
                <div key={i} className="addendum-entry">
                  <span className="addendum-label">
                    Addendum {scp.item}-{String.fromCharCode(65 + i)}:
                  </span>
                  <p>{entry}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {referencesArray.length > 0 && (
          <section className="scp-section" data-testid="scp-references">
            <h2 className="scp-section-title">
              <span className="section-marker">&#9612;</span>
              References
            </h2>
            <div className="scp-section-body">
              {referencesArray.map((ref, i) => (
                <div key={i} className="reference-entry">
                  <span className="reference-number">[{i + 1}]</span>
                  <p>{ref}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="scp-doc-footer reveal">
          <span>DOCUMENT {scp.item}</span>
          <span>CLEARANCE LEVEL: {scp.object_class === 'Keter' ? '4' : scp.object_class === 'Euclid' ? '3' : '2'}</span>
          <span>SCP FOUNDATION -- INTERNAL DOCUMENT</span>
        </div>

      </div>
    </div>
  );
}

export default SCPPage;