import { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import HomePage from './components/HomePage';
import SCPPage from './components/SCPPage';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [scpList, setScpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetches all SCP records from Supabase REST API on app load
  const fetchSCPs = async () => {
    const { data, error } = await supabase
      .from('scp')
      .select('*')
      .order('item', { ascending: true });

    if (error) {
      setError('Failed to load SCP data.');
    } else {
      setScpList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSCPs();
  }, []);

  // Shows a success message for 3 seconds then hides it
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Called after Create or Update — refreshes data and navigates
  const handleSuccess = async (message, navigateTo = 'Home') => {
    await fetchSCPs();
    showSuccess(message);
    setActivePage(navigateTo);
  };

  // Called after Delete — refreshes data and goes home
  const handleDelete = async () => {
    await fetchSCPs();
    showSuccess('SCP entry deleted successfully.');
    setActivePage('Home');
  };

  const currentSCP = activePage !== 'Home'
    ? scpList.find(s => s.item === activePage)
    : null;

  if (loading) return <div className="loading">LOADING CLASSIFIED FILES...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app" data-testid="app">
      <NavMenu
        activePage={activePage}
        onNavigate={setActivePage}
        scpList={scpList}
      />

      {/* Global success message shown after CRUD operations */}
      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      <main className="main-content">
        {activePage === 'Home' ? (
          <HomePage
            onNavigate={setActivePage}
            scpList={scpList}
            onSuccess={handleSuccess}
          />
        ) : (
          <SCPPage
            scp={currentSCP}
            onSuccess={handleSuccess}
            onDelete={handleDelete}
            onNavigate={setActivePage}
          />
        )}
      </main>
    </div>
  );
}

export default App;