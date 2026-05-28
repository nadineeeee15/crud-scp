// NavMenu.jsx
// The fixed top navigation bar for the SCP Foundation app.
// Renders the logo, Home button and a Catalogue dropdown on desktop.
// On mobile, switches to a hamburger menu that reveals all SCP links in a slide-down panel.
// Receives scpList from App.jsx to dynamically generate navigation items from the database.

import { useState, useRef, useEffect } from 'react';
import './NavMenu.css';

function NavMenu({ activePage, onNavigate, scpList }) {
  // Controls whether the mobile hamburger menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Controls whether the desktop Catalogue dropdown is open or closed
  const [catalogueOpen, setCatalogueOpen] = useState(false);

  // Ref attached to the catalogue wrapper div to detect outside clicks
  const catalogueRef = useRef(null);

  // Closes the catalogue dropdown when the user clicks anywhere outside of it
  // Uses mousedown event listener on the document for reliable outside click detection
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catalogueRef.current && !catalogueRef.current.contains(e.target)) {
        setCatalogueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup removes the event listener when the component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Central navigation handler — updates the active page and closes all menus
  const handleNavigate = (item) => {
    onNavigate(item); // Passes the selected page name up to App.jsx
    setMenuOpen(false); // Closes mobile menu after navigation
    setCatalogueOpen(false); // Closes catalogue dropdown after navigation
  };

  // Checks if the currently active page is one of the SCP entries
  // Used to highlight the Catalogue button when any SCP page is active
  const isScpActive = scpList.some(s => s.item === activePage);

  return (
    <nav className="navbar" data-testid="navbar">

      {/* Logo — clicking it always navigates back to the homepage */}
      <div className="logo" onClick={() => handleNavigate('Home')} data-testid="logo">
        <span className="logo-icon">☣</span>
        <div className="logo-text">
          <span className="logo-main">SCP FOUNDATION</span>
          <span className="logo-sub">Secure · Contain · Protect</span>
        </div>
      </div>

      {/* Desktop navigation — hidden on mobile via CSS media query */}
      <ul className="nav-links" data-testid="nav-links">
        <li>
          {/* Home button — highlights with active class when on the homepage */}
          <button
            className={'nav-btn ' + (activePage === 'Home' ? 'active' : '')}
            onClick={() => handleNavigate('Home')}
            data-testid="nav-Home"
            aria-current={activePage === 'Home' ? 'page' : undefined}
          >
            Home
            {/* Active indicator line shown beneath the button when Home is selected */}
            {activePage === 'Home' && <span className="active-indicator" />}
          </button>
        </li>

        {/* Catalogue dropdown wrapper — ref used to detect outside clicks */}
        <li ref={catalogueRef} className="catalogue-wrapper">
          {/* Catalogue toggle button — highlights when any SCP page is active */}
          <button
            className={'nav-btn ' + (isScpActive ? 'active' : '')}
            onClick={() => setCatalogueOpen(!catalogueOpen)}
            data-testid="nav-catalogue"
          >
            Catalogue ▾
            {/* Active indicator shown when user is viewing any SCP entry */}
            {isScpActive && <span className="active-indicator" />}
          </button>

          {/* Dropdown grid — conditionally rendered when catalogueOpen is true
              Displays all SCP entries fetched from Supabase in a 4-column grid */}
          {catalogueOpen && (
            <div className="catalogue-dropdown">
              <div className="catalogue-grid">
                {scpList.map((scp) => (
                  <button
                    key={scp.id} // Unique Supabase ID used as React key
                    className={'catalogue-item ' + (activePage === scp.item ? 'active' : '')}
                    onClick={() => handleNavigate(scp.item)}
                    data-testid={'nav-' + scp.item} // Used by Vitest automated tests
                  >
                    {scp.item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </li>
      </ul>

      {/* Security clearance label — decorative element on the right of the navbar */}
      <div className="nav-clearance">LEVEL 5 ACCESS</div>

      {/* Hamburger button — only visible on mobile via CSS media query
          Animates into an X icon when the menu is open */}
      <button
        className={'hamburger ' + (menuOpen ? 'open' : '')}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        data-testid="hamburger"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile slide-down menu — contains Home and all SCP links
          Slides open when hamburger is clicked and closes after navigation */}
      <div className={'mobile-menu ' + (menuOpen ? 'mobile-menu-open' : '')}>
        {/* Home button in mobile menu */}
        <button
          className={'mobile-nav-btn ' + (activePage === 'Home' ? 'active' : '')}
          onClick={() => handleNavigate('Home')}
        >
          Home
        </button>

        {/* Dynamically renders one button per SCP entry from Supabase */}
        {scpList.map((scp) => (
          <button
            key={scp.id} // Unique Supabase ID used as React key
            className={'mobile-nav-btn ' + (activePage === scp.item ? 'active' : '')}
            onClick={() => handleNavigate(scp.item)}
          >
            {scp.item}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavMenu;