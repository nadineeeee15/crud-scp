
// The root component of the SCP Foundation application.
// Manages global application state including the active page, SCP data list,
// loading and error states, and success notifications.
// Fetches all SCP records from Supabase on load and passes data down to child components.
// Acts as the central hub for all navigation and CRUD operation callbacks.

import { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';     // Fixed top navigation bar
import HomePage from './components/HomePage';   // Landing page with SCP catalogue grid
import SCPPage from './components/SCPPage';     // Individual SCP document viewer
import { supabase } from './supabaseClient';    // Supabase client for REST API calls
import './App.css';

function App() {
  // Tracks which page is currently displayed — 'Home' or an SCP item name e.g. 'SCP-002'
  const [activePage, setActivePage] = useState('Home');

  // Stores the full list of SCP records fetched from Supabase
  // Passed as a prop to NavMenu and HomePage for dynamic rendering
  const [scpList, setScpList] = useState([]);

  // Controls the loading screen shown while Supabase data is being fetched
  const [loading, setLoading] = useState(true);

  // Stores any error message if the Supabase fetch fails
  const [error, setError] = useState(null);

  // Stores the current success notification message shown after CRUD operations
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetches all SCP records from the Supabase scp table ordered alphabetically by item name
  // Defined outside useEffect so it can be called again after Create, Update or Delete
  const fetchSCPs = async () => {
    const { data, error } = await supabase
      .from('scp')
      .select('*')
      .order('item', { ascending: true }); // Orders results alphabetically e.g. SCP-002, SCP-003

    if (error) {
      setError('Failed to load SCP data.'); // Shows error screen if fetch fails
    } else {
      setScpList(data); // Updates the SCP list with fresh data from Supabase
    }
    setLoading(false); // Hides the loading screen once fetch is complete
  };

  // Runs fetchSCPs once when the component first mounts
  // Empty dependency array [] ensures it only runs on initial load
  useEffect(() => {
    fetchSCPs();
  }, []);

  // Displays a success toast notification for 3 seconds then automatically hides it
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Called after a successful Create or Update operation
  // Re-fetches the SCP list to reflect the latest data, shows a success message,
  // and navigates to the specified page (defaults to Home if not provided)
  const handleSuccess = async (message, navigateTo = 'Home') => {
    await fetchSCPs();        // Refreshes SCP list from Supabase
    showSuccess(message);     // Shows the success toast notification
    setActivePage(navigateTo); // Navigates to the correct page after the operation
  };

  // Called after a successful Delete operation
  // Re-fetches the SCP list, shows a success message and navigates back to the homepage
  const handleDelete = async () => {
    await fetchSCPs();
    showSuccess('SCP entry deleted successfully.');
    setActivePage('Home');
  };

  // Finds the currently active SCP object from the scpList array
  // Returns null when on the homepage so SCPPage is not rendered
  const currentSCP = activePage !== 'Home'
    ? scpList.find(s => s.item === activePage) // Matches SCP by item name e.g. SCP-002
    : null;

  // Shows a full screen loading message while Supabase data is being fetched
  if (loading) return <div className="loading">LOADING CLASSIFIED FILES...</div>;

  // Shows a full screen error message if the Supabase fetch fails
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app" data-testid="app">
      {/* Navigation bar — receives scpList to dynamically generate catalogue items */}
      <NavMenu
        activePage={activePage}
        onNavigate={setActivePage}
        scpList={scpList}
      />

      {/* Success toast notification — only rendered when a CRUD operation succeeds
          Automatically disappears after 3 seconds via the showSuccess function */}
      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      <main className="main-content">
        {/* Conditionally renders either the HomePage or SCPPage based on activePage state
            This is the core SPA logic — no page reloads, just conditional rendering */}
        {activePage === 'Home' ? (
          // HomePage receives the full SCP list and the success handler for the Add form
          <HomePage
            onNavigate={setActivePage}
            scpList={scpList}
            onSuccess={handleSuccess}
          />
        ) : (
          // SCPPage receives the current SCP object and handlers for Edit and Delete
          <SCPPage
            scp={currentSCP}
            onSuccess={handleSuccess}
            onDelete={handleDelete}
            onNavigate={setActivePage}
            scpList={scpList}
          />
        )}
      </main>
    </div>
  );
}

export default App;