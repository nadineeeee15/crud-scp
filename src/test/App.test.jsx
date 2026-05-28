
// Automated UI test suite for the SCP Foundation application.
// Built using Vitest and React Testing Library.
// Tests cover navigation, home page rendering, SCP page content,
// and single page application behaviour to ensure all UI functions
// work correctly without errors across desktop and mobile devices.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('SCP Foundation App', () => {
  // Renders a fresh instance of the App before every individual test case
  // This ensures each test starts from a clean state with no leftover DOM
  beforeEach(() => {
    render(<App />);
  });

  // ── Navigation Tests

  it('renders the navbar with logo and all navigation items', () => {
    // Verifies the main navigation container and logo are present in the DOM
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();

    // Checks that nav buttons for Home and all 5 SCP entries are rendered
    const navItems = ['Home', 'SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'];
    navItems.forEach(item => {
      expect(screen.getByTestId(`nav-${item}`)).toBeInTheDocument();
    });
  });

  it('highlights Home as active by default', () => {
    // Confirms the Home nav button has the active CSS class on initial load
    // This verifies the default state of the application is the homepage
    expect(screen.getByTestId('nav-Home')).toHaveClass('active');
  });

  it('highlights the correct nav item when clicked', () => {
    // Simulates clicking SCP-003 and checks if the active class is applied to it
    fireEvent.click(screen.getByTestId('nav-SCP-003'));
    expect(screen.getByTestId('nav-SCP-003')).toHaveClass('active');
    // Confirms Home is no longer marked as active after navigating away
    expect(screen.getByTestId('nav-Home')).not.toHaveClass('active');
  });

  it('returns to home page when logo is clicked', () => {
    // Navigates to an SCP page first then clicks the logo
    // Verifies the logo always acts as a Home button
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    fireEvent.click(screen.getByTestId('logo'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // Home Page Tests 
  it('renders the home page with all 5 SCP file cards', () => {
    // Ensures the homepage displays the full SCP catalogue grid
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    ['SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'].forEach(id => {
      expect(screen.getByTestId(`home-card-${id}`)).toBeInTheDocument();
    });
  });

  it('navigates to the correct SCP page when a home card is clicked', () => {
    // Verifies clicking a card on the homepage opens the correct SCP detail page
    // Checks both that the page renders and displays the correct item ID
    fireEvent.click(screen.getByTestId('home-card-SCP-004'));
    expect(screen.getByTestId('scp-page')).toBeInTheDocument();
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-004');
  });

  //  SCP Pages (Detail View) Tests 

  it('renders SCP-002 page with correct ID and object class', () => {
    // Checks that SCP-002 displays its item number and object class label
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-002');
    expect(screen.getByTestId('scp-class')).toBeInTheDocument();
  });

  it('renders SCP-002 containment, description and references sections', () => {
    // SCP-002 uses references instead of addendum — verifies all three sections render
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-references')).toBeInTheDocument();
  });

  it('renders SCP-003 page with containment, description and addendum', () => {
    // SCP-003 uses addendum — confirms all three sections render correctly
    fireEvent.click(screen.getByTestId('nav-SCP-003'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-003');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-addendum')).toBeInTheDocument();
  });

  it('renders SCP-004 page with all content sections', () => {
    // Checks SCP-004 renders containment, description and tags sections
    fireEvent.click(screen.getByTestId('nav-SCP-004'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-004');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
    expect(screen.getByTestId('scp-tags')).toBeInTheDocument();
  });

  it('renders SCP-005 and SCP-006 pages correctly', () => {
    // Bulk verification of navigation and basic content for SCP-005 and SCP-006
    fireEvent.click(screen.getByTestId('nav-SCP-005'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-005');
    fireEvent.click(screen.getByTestId('nav-SCP-006'));
    expect(screen.getByTestId('scp-id').textContent).toBe('SCP-006');
    expect(screen.getByTestId('scp-containment')).toBeInTheDocument();
    expect(screen.getByTestId('scp-description')).toBeInTheDocument();
  });

  it('displays tags on every SCP page', () => {
    // Iterates through all SCPs to confirm the tags section is universally present
    // Tags are stored as comma-separated strings in Supabase and parsed into an array
    ['SCP-002', 'SCP-003', 'SCP-004', 'SCP-005', 'SCP-006'].forEach(id => {
      fireEvent.click(screen.getByTestId(`nav-${id}`));
      expect(screen.getByTestId('scp-tags')).toBeInTheDocument();
    });
  });

  // Single Page Application (SPA) Logic Tests 

  it('does not reload the page when navigating between sections', () => {
    // Verifies the app uses internal React state routing rather than full browser reloads
    // If the URL remains unchanged after navigation it confirms SPA behaviour
    const initialURL = window.location.href;
    fireEvent.click(screen.getByTestId('nav-SCP-005'));
    fireEvent.click(screen.getByTestId('nav-Home'));
    expect(window.location.href).toBe(initialURL);
  });

  it('only renders one view at a time', () => {
    // Critical SPA test — confirms clicking a nav link replaces the current view
    // rather than appending a new view to the DOM alongside the existing one
    fireEvent.click(screen.getByTestId('nav-SCP-002'));
    const homes = document.querySelectorAll('[data-testid="home-page"]');
    const scpPages = document.querySelectorAll('[data-testid="scp-page"]');
    // Total views in the DOM must equal exactly 1 at any given time
    expect(homes.length + scpPages.length).toBe(1);
  });

  it('navigates back to home from any SCP page', () => {
    // Verifies the Home nav link works correctly even from deep within an SCP detail page
    fireEvent.click(screen.getByTestId('nav-SCP-006'));
    expect(screen.getByTestId('scp-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('nav-Home'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});