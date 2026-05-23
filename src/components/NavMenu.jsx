import { useState, useRef, useEffect } from 'react';
import './NavMenu.css';

function NavMenu({ activePage, onNavigate, scpList }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const catalogueRef = useRef(null);

  // Closes catalogue dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catalogueRef.current && !catalogueRef.current.contains(e.target)) {
        setCatalogueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (item) => {
    onNavigate(item);
    setMenuOpen(false);
    setCatalogueOpen(false);
  };

  const isScpActive = scpList.some(s => s.item === activePage);

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="logo" onClick={() => handleNavigate('Home')} data-testid="logo">
        <span className="logo-icon">☣</span>
        <div className="logo-text">
          <span className="logo-main">SCP FOUNDATION</span>
          <span className="logo-sub">Secure · Contain · Protect</span>
        </div>
      </div>

      {/* Desktop nav */}
      <ul className="nav-links" data-testid="nav-links">
        <li>
          <button
            className={'nav-btn ' + (activePage === 'Home' ? 'active' : '')}
            onClick={() => handleNavigate('Home')}
            data-testid="nav-Home"
            aria-current={activePage === 'Home' ? 'page' : undefined}
          >
            Home
            {activePage === 'Home' && <span className="active-indicator" />}
          </button>
        </li>

        {/* Catalogue dropdown */}
        <li ref={catalogueRef} className="catalogue-wrapper">
          <button
            className={'nav-btn ' + (isScpActive ? 'active' : '')}
            onClick={() => setCatalogueOpen(!catalogueOpen)}
            data-testid="nav-catalogue"
          >
            Catalogue ▾
            {isScpActive && <span className="active-indicator" />}
          </button>

          {catalogueOpen && (
            <div className="catalogue-dropdown">
              <div className="catalogue-grid">
                {scpList.map((scp) => (
                  <button
                    key={scp.id}
                    className={'catalogue-item ' + (activePage === scp.item ? 'active' : '')}
                    onClick={() => handleNavigate(scp.item)}
                    data-testid={'nav-' + scp.item}
                  >
                    {scp.item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </li>
      </ul>

      <div className="nav-clearance">LEVEL 5 ACCESS</div>

      {/* Hamburger button — mobile only */}
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

      {/* Mobile dropdown menu */}
      <div className={'mobile-menu ' + (menuOpen ? 'mobile-menu-open' : '')}>
        <button
          className={'mobile-nav-btn ' + (activePage === 'Home' ? 'active' : '')}
          onClick={() => handleNavigate('Home')}
        >
          Home
        </button>
        {scpList.map((scp) => (
          <button
            key={scp.id}
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