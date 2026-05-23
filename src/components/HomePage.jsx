import { useState } from 'react';
import SCPForm from './SCPForm';
import './HomePage.css';

function HomePage({ onNavigate, scpList, onSuccess }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="home-page" data-testid="home-page">
      <div className="home-bg" />
      <div className="scanlines" />

      {/* Add New SCP form modal */}
      {showAddForm && (
        <SCPForm
          onSuccess={(message, navigateTo) => {
            setShowAddForm(false);
            onSuccess(message, navigateTo);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="hero-section">

        <div className="hero-scp-letters">
          <span className="scp-letter">S</span>
          <span className="scp-letter">C</span>
          <span className="scp-letter">P</span>
        </div>

        <div className="hero-tagline">SECURE. CONTAIN. PROTECT.</div>

        <div className="hero-image-wrap">
          <img
            src="/PlagueBg.png"
            alt="SCP Foundation Containment Personnel"
            className="hero-img"
          />
        </div>

        <div className="hero-warning" style={{ marginTop: '3rem' }}>
          <span className="warning-label">⚠ WARNING</span>
          Unauthorized access is a violation of Foundation protocol.
        </div>

        {/* Add New SCP button */}
        <button
          className="btn-add-scp"
          onClick={() => setShowAddForm(true)}
        >
          + ADD NEW SCP ENTRY
        </button>

        <div className="scp-grid">
          {scpList.map((scp) => (
            <button
              key={scp.id}
              className="scp-card"
              onClick={() => onNavigate(scp.item)}
              data-testid={'home-card-' + scp.item}
            >
              <span className="card-id">{scp.item}</span>
              <span className="card-label">VIEW FILE</span>
            </button>
          ))}
        </div>

        <div className="home-footer-text">
          © SCP Foundation · All Rights Reserved · Unauthorized reproduction is punishable under O5 mandate 7-G
        </div>
      </div>
    </div>
  );
}

export default HomePage;