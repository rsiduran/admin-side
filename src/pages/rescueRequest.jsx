import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';

const RescueRequest = () => {
  const navigate = useNavigate();

  
  return (
    <div>
      <AppSideBar />
      Welcome RescueRequest
    </div>
  );
};

export default RescueRequest;