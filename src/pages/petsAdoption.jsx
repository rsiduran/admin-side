import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';

const PetsAdoption = () => {
  const navigate = useNavigate();

  return (
    <div>
      <AppSideBar />
      Welcome PetsAdoption
    </div>
  );
};

export default PetsAdoption;