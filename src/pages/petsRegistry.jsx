import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';

const PetsRegistry = () => {
  const navigate = useNavigate();

  return (
    <div>
      <AppSideBar />
      Welcome PetsRegistry
    </div>
  );
};

export default PetsRegistry;