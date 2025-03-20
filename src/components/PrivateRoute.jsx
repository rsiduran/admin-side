import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Authentication check
  return isLoggedIn ? <Element /> : <Navigate to="/" />;
};

export default PrivateRoute;
