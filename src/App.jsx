import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './pages/dashboard';
import Users from './pages/users';
import PetsRegistry from './pages/petsRegistry';
import AdoptionRequest from './pages/adoptionRequest';
import PetsAdoption from './pages/petsAdoption';
import RescueRequest from './pages/rescueRequest';
import History from './pages/history';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]); // Add an empty dependency array to ensure this runs only once

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<Users />} /> 
      <Route path="/petsRegistry" element={<PetsRegistry />} /> 
      <Route path="/petsAdoption" element={<PetsAdoption />} /> 
      <Route path="/AdoptionRequest" element={<AdoptionRequest />} /> 
      <Route path="/RescueRequest" element={<RescueRequest />} /> 
      <Route path="/History" element={<History />} /> 
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}