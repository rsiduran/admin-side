// auth/logout.js
import { useNavigate } from 'react-router-dom';

export const handleLogout = (navigate) => {
  localStorage.removeItem('isLoggedIn');
  navigate('/');
};