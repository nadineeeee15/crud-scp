import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('SCP Foundation App', () => {
  // Renders a fresh instance of the App before every individual test case
  beforeEach(() => {
    render(<App />);
  });

  // Navigation Tests
  
  it('renders the navbar with logo and all navigation items', () => {
    // Verifies the main navigation container and logo are present
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    
    // Checks that links for all 5 SCP entries are rendered in the nav
    const navItems = ['Home', 'SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'];
    navItems.forEach(item => {
      expect(screen.getByTestId(`nav-${item}`)).toBeInTheDocument();
    });
  });

  it('highlights Home as active by default', () => {
    // Confirms the 'Home' link has the 'active' CSS class on initial load
    expect(screen.getByTestId('nav-Home')).toHaveClass('active');
  });

  it('highlights the correct nav item when clicked', () => {
    // Simulates clicking 'SCP-003' and checks if the 'active' class moves to it
    fireEvent.click(screen.getByTestId('nav-SCP-003'));
    expect(screen.getByTestId('nav-SCP-003')).toHaveClass('active');
    // Confirms 'Home' is no longer marked as active
    expect(screen.getByTestId('nav-Home')).not.toHaveClass('active');
  });

  it('returns to home page when logo is clicked', () => {
    // Navigates away to an SCP page, then clicks the logo to verify redirection to home
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    fireEvent.click(screen.getByTestId('logo'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  //Home Page Tests

  it('renders the home page with all 5 SCP file cards', () => {
    // Ensures the home view displays the catalog of all SCP cards
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    ['SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'].forEach(id => {
      expect(screen.getByTestId(`home-card-${id}`)).toBeInTheDocument();
    });
  });

  it('navigates to the correct SCP page when a home card is clicked', () => {
    // Verifies that clicking a card on the home screen opens that specific SCP's detail page
    fireEvent.click(screen.getByTestId('home-card-SCP-004'));
    expect(screen.getByTestId('scp-page')).toBeInTheDocument();
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-004');
  });

  //SCP Pages (Detail View) Tests 

  it('renders SCP-002 page with correct ID and object class', () => {
    // Checks basic metadata rendering for SCP-002
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-002');
    expect(screen.getByTestId('scp-class')).toBeInTheDocument();
  });

  it('renders SCP-002 containment, description and references sections', () => {
    // Ensures SCP-002 displays its specific documentation sections
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-references')).toBeInTheDocument();
  });

  it('renders SCP-003 page with containment, description and addendum', () => {
    // Confirms SCP-003 shows an 'addendum' section (which might be unique to its data)
    fireEvent.click(screen.getByTestId('nav-SCP-003'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-003');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-addendum')).toBeInTheDocument();
  });

  it('renders SCP-004 page with all content sections', () => {
    // Checks SCP-004 for general content structure and tags
    fireEvent.click(screen.getByTestId('nav-SCP-004'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-004');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-tags')).toBeInTheDocument();
  });

  it('renders SCP-005 and SCP-006 pages correctly', () => {
    // Bulk verification of navigation and basic content for the remaining SCPs
    fireEvent.click(screen.getByTestId('nav-SCP-005'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-005');
    fireEvent.click(screen.getByTestId('nav-SCP-006'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-006');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
  });

  it('displays tags on every SCP page', () => {
    // Iterates through all SCPs to ensure the 'tags' metadata is universally present
    ['SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'].forEach(id => {
      fireEvent.click(screen.getByTestId(`nav-${id}`));
      expect(screen.getByTestId('scp-tags')).toBeInTheDocument();
    });
  });

  //Single Page Application (SPA) Logic Tests 

  it('does not reload the page when navigating between sections', () => {
    // Verifies that the app uses internal routing rather than full browser refreshes
    const initialURL = window.location.href;
    fireEvent.click(screen.getByTestId('nav-SCP-005'));
    fireEvent.click(screen.getByTestId('nav-Home'));
    // If the URL is unchanged (or follows SPA logic), it confirms no hard reload occurred
    expect(window.location.href).toBe(initialURL);
  });

  it('only renders one view at a time', () => {
    // Crucial for SPAs: confirms clicking a link replaces the old view rather than appending to it
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    const homes = document.querySelectorAll('[data-testid="home-page"]');
    const scpPages = document.querySelectorAll('[data-testid="scp-page"]');
    // Logic: Total views rendered must equal exactly 1
    expect(homes.length + scpPages.length).toBe(1);
  });

  it('navigates back to home from any SCP page', () => {
    // Verifies the "Home" nav link works correctly even when deep within an SCP detail page
    fireEvent.click(screen.getByTestId('nav-SCP-006'));
    expect(screen.getByTestId('scp-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('nav-Home'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});