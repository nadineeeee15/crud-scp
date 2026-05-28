// HomePage.jsx
// The main landing page of the SCP Foundation app.
// Displays the hero section, SCP catalogue grid and the Add New SCP button.
// Receives scpList from App.jsx (fetched from Supabase) and renders it dynamically.

import { useState } from 'react';
import SCPForm from './SCPForm'; // Reusable form component for Create and Update operations
import './HomePage.css';

function HomePage({ onNavigate, scpList, onSuccess }) {
  // Controls whether the Add New SCP modal form is visible or hidden
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="home-page" data-testid="home-page">
      {/* Background image layer */}
      <div className="home-bg" />

      {/* CRT scanline overlay for visual effect */}
      <div className="scanlines" />

      {/* Conditionally renders the Add New SCP form as a modal overlay
          Only shown when the user clicks the Add New SCP button */}
      {showAddForm && (
        <SCPForm
          onSuccess={(message, navigateTo) => {
            // Close the form first then trigger success handler in App.jsx
            // which refreshes the SCP list and shows the success toast
            setShowAddForm(false);
            onSuccess(message, navigateTo);
          }}
          onCancel={() => setShowAddForm(false)} // Closes form without saving
        />
      )}

      <div className="hero-section">

        {/* Large animated neon S C P letters at the top of the page */}
        <div className="hero-scp-letters">
          <span className="scp-letter">S</span>
          <span className="scp-letter">C</span>
          <span className="scp-letter">P</span>
        </div>

        {/* Foundation tagline displayed beneath the SCP letters */}
        <div className="hero-tagline">SECURE. CONTAIN. PROTECT.</div>

        {/* Hero image — plague doctor characters with transparent background
            mix-blend-mode: screen in CSS removes the dark background */}
        <div className="hero-image-wrap">
          <img
            src="/PlagueBg.png"
            alt="SCP Foundation Containment Personnel"
            className="hero-img"
          />
        </div>

        {/* Warning bar displayed below the hero image */}
        <div className="hero-warning" style={{ marginTop: '3rem' }}>
          <span className="warning-label">⚠ WARNING</span>
          Unauthorized access is a violation of Foundation protocol.
        </div>

        {/* Button that opens the Add New SCP modal form
            Sets showAddForm to true which renders SCPForm above */}
        <button
          className="btn-add-scp"
          onClick={() => setShowAddForm(true)}
        >
          + ADD NEW SCP ENTRY
        </button>

        {/* Dynamically renders one card per SCP entry fetched from Supabase
            Each card navigates to the corresponding SCP page when clicked */}
        <div className="scp-grid">
          {scpList.map((scp) => (
            <button
              key={scp.id} // Unique Supabase ID used as React key for efficient re-rendering
              className="scp-card"
              onClick={() => onNavigate(scp.item)} // Passes SCP item name e.g. SCP-002 to App.jsx
              data-testid={'home-card-' + scp.item} // Used by Vitest for automated UI testing
            >
              <span className="card-id">{scp.item}</span>
              <span className="card-label">VIEW FILE</span>
            </button>
          ))}
        </div>

        {/* Footer text at the bottom of the homepage */}
        <div className="home-footer-text">
          © SCP Foundation · All Rights Reserved · Unauthorized reproduction is punishable under O5 mandate 7-G
        </div>
      </div>
    </div>
  );
}

export default HomePage;