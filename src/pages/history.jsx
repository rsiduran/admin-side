import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';

const History = () => {
  const navigate = useNavigate();

  return (
    <div>
      <AppSideBar />
      Welcome History
    </div>
  );
};

export default History;