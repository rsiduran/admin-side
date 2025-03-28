import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './pages/dashboard';
import Users from './pages/users';
import PetsRegistry from './pages/petsRegistry';
import AdoptionRequest from './pages/adoptionRequest';
import PetsAdoption from './pages/petsAdoption';
import RescueRequest from './pages/rescueRequest';
import UploadArticlesVet from './pages/uploadArticlesVet';
import History from './pages/history';
import UserProfile from './pages/UserProfile';
import ViewProfile from './pages/VIewProfile';


function App() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/users"
        element={isLoggedIn ? <Users /> : <Navigate to="/" />}
      />
      <Route
        path="/petsRegistry"
        element={isLoggedIn ? <PetsRegistry /> : <Navigate to="/" />}
      />
      <Route
        path="/petsAdoption"
        element={isLoggedIn ? <PetsAdoption /> : <Navigate to="/" />}
      />
      <Route
        path="/AdoptionRequest"
        element={isLoggedIn ? <AdoptionRequest /> : <Navigate to="/" />}
      />
      <Route
        path="/RescueRequest"
        element={isLoggedIn ? <RescueRequest /> : <Navigate to="/" />}
      />
      <Route
        path="/uploadArticlesVet"
        element={isLoggedIn ? <UploadArticlesVet /> : <Navigate to="/" />}
      />
      <Route
        path="/History"
        element={isLoggedIn ? <History /> : <Navigate to="/" />}
      />
      <Route
        path="/profile/:email"
        element={isLoggedIn ? <UserProfile /> : <Navigate to="/" />}
      />
      <Route
        path="/view-profile/:collectionName/:id"
        element={isLoggedIn ? <ViewProfile /> : <Navigate to="/" />}
      />
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