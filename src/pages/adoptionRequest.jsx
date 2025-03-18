import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';

const AdoptionRequest = () => {
  const navigate = useNavigate();

  
  return (
    <div>
      <AppSideBar />
      Welcome AdoptionRequest
    </div>
  );
};

export default AdoptionRequest;