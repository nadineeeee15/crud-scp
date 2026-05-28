
// The entry point of the SCP Foundation React application.
// This is the first file executed when the app loads in the browser.


import { StrictMode } from 'react'          // StrictMode enables extra development warnings
import { createRoot } from 'react-dom/client' // React 18 API for rendering the app
import './App.css'                            // Global CSS styles applied across the entire app
import App from './App.jsx'                  // Root component that manages all app state and routing

// Creates a React root attached to the #root div in index.html
// and renders the App component wrapped in StrictMode.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)