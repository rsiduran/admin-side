// auth/navigate.js
import { useNavigate } from 'react-router-dom';

export const DashboardNavigate = (navigate) => {
  navigate('/dashboard');
};

export const UsersNavigate = (navigate) => {
  navigate('/users');
};

export const WanderPetsRegistryNavigate = (navigate) => {
  navigate('/petsRegistry');
};

export const PetsAdoption = (navigate) => {
  navigate('/petsAdoption');
};

export const AdoptionRequest = (navigate) => {
  navigate('/adoptionRequest');
};

export const RescueRequest = (navigate) => {
  navigate('/rescueRequest');
};

export const History = (navigate) => {
  navigate('/history');
};


