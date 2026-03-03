import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DataFeed from './pages/DataFeed';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Landing Page will load on the default URL */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The Dashboard will load when we go to /dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* The Data Feed Page will load when we go to /data-feed */}
        <Route path="/data-feed" element={<DataFeed />} />
      </Routes>
    </Router>
  );
}

export default App;