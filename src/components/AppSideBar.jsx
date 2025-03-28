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
  FaFileUpload, // Added icon for Upload Articles/Vet
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
  UploadArticlesVet, // Add navigation function for Upload Articles/Vet
} from "../auth/navigate";

const AppSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
          {[
            { icon: <FaTachometerAlt className="text-lg" />, text: "Dashboard", onClick: () => DashboardNavigate(navigate) },
            { icon: <FaUsers className="text-lg" />, text: "Users", onClick: () => UsersNavigate(navigate) },
            { icon: <FaPaw className="text-lg" />, text: "WanderPets Registry", onClick: () => WanderPetsRegistryNavigate(navigate) },
            { icon: <FaHandHoldingHeart className="text-lg" />, text: "Pets Adoption", onClick: () => PetsAdoption(navigate) },
            { icon: <FaClipboardList className="text-lg" />, text: "Adoption Application", onClick: () => AdoptionRequest(navigate) },
            { icon: <FaHandsHelping className="text-lg" />, text: "Rescue Request", onClick: () => RescueRequest(navigate) },
            { icon: <FaHistory className="text-lg" />, text: "History", onClick: () => History(navigate) },
            { icon: <FaFileUpload className="text-lg" />, text: "Upload Articles/Clinic", onClick: () => UploadArticlesVet(navigate) }, // Added Upload Articles/Vet
            { icon: <FaSignOutAlt className="text-lg" />, text: "Logout", onClick: () => handleLogout(navigate) },
          ].map((item, index) => (
            <li
              key={index}
              className="relative group p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap"
              onClick={item.onClick}
            >
              {item.icon}
              {isOpen && <span className="ml-4">{item.text}</span>}

              {/* Tooltip */}
              {!isOpen && (
                <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-black text-white text-xs py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AppSideBar;