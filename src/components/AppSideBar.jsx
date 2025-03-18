import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaPaw,
  FaSignOutAlt,
  FaHandHoldingHeart,
  FaClipboardList,
  FaHandsHelping,
  FaHistory,
} from "react-icons/fa";
import { handleLogout } from "../auth/logout";
import {
  AdoptionRequest,
  DashboardNavigate,
  History,
  PetsAdoption,
  RescueRequest,
  UsersNavigate,
  WanderPetsRegistryNavigate,
} from "../auth/navigate";

const AppSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 h-full bg-green-800 text-white shadow-lg ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button with Supremo Furbabies */}
      <div className="flex items-center p-4">
        <button
          className="p-2 bg-green-800 text-white rounded-full hover:bg-green-700 transition-colors duration-200"
          onClick={toggleSidebar}
        >
          {isOpen ? "✕" : "☰"}
        </button>
        {isOpen && <span className="ml-4 font-bold whitespace-nowrap">Supremo Furbabies</span>}
      </div>

      {/* Sidebar */}
      <div className="h-full">
        <ul className="mt-4">
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => DashboardNavigate(navigate)}
          >
            <FaTachometerAlt className="text-lg" />
            {isOpen && <span className="ml-4">Dashboard</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => UsersNavigate(navigate)}
          >
            <FaUsers className="text-lg" />
            {isOpen && <span className="ml-4">Users</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => WanderPetsRegistryNavigate(navigate)}
          >
            <FaPaw className="text-lg" />
            {isOpen && <span className="ml-4">WanderPets Registry</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => PetsAdoption(navigate)}
          >
            <FaHandHoldingHeart className="text-lg" />
            {isOpen && <span className="ml-4">Pets Adoption</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => AdoptionRequest(navigate)}
          >
            <FaClipboardList className="text-lg" />
            {isOpen && <span className="ml-4">Adoption Application</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => RescueRequest(navigate)}
          >
            <FaHandsHelping className="text-lg" />
            {isOpen && <span className="ml-4">Rescue Request</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => History(navigate)}
          >
            <FaHistory className="text-lg" />
            {isOpen && <span className="ml-4">History</span>}
          </li>
          <li
            className="p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
            onClick={() => handleLogout(navigate)}
          >
            <FaSignOutAlt className="text-lg" />
            {isOpen && <span className="ml-4">Logout</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AppSideBar;
