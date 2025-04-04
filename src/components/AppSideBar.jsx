import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  FaTachometerAlt,
  FaUsers,
  FaPaw,
  FaSignOutAlt,
  FaHandHoldingHeart,
  FaClipboardList,
  FaHandsHelping,
  FaHistory,
  FaFileUpload,
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
  UploadArticlesVet,
} from "../auth/navigate";

const AppSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const collections = {
        "Rescue Request": "rescue",
        "Adoption Request": "adoptionApplication",
        "Registry": ["missing", "wandering", "found"],
        "History": ["userpetsHistory", "lostFoundHistory", "adoptionApplicationHistory", "rescueHistory"],
      };

      let newNotifications = {};
      for (const [key, col] of Object.entries(collections)) {
        if (Array.isArray(col)) {
          let totalCount = 0;
          for (const subCol of col) {
            const q = query(collection(db, subCol), where("viewed", "==", "NO"));
            const snapshot = await getDocs(q);
            totalCount += snapshot.size;
          }
          newNotifications[key] = totalCount;
        } else {
          const q = query(collection(db, col), where("viewed", "==", "NO"));
          const snapshot = await getDocs(q);
          newNotifications[key] = snapshot.size;
        }
      }
      setNotifications(newNotifications);
    };
    fetchNotifications();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 h-full bg-green-800 text-white shadow-lg ${isOpen ? "w-64" : "w-16"} transition-all duration-300 ease-in-out`}>
      <div className="flex items-center p-4">
        <button className="p-2 bg-green-800 text-white rounded-full hover:bg-green-700 transition-colors duration-200" onClick={toggleSidebar}>
          {isOpen ? "✕" : "☰"}
        </button>
        {isOpen && <span className="ml-4 font-bold whitespace-nowrap">Supremo Furbabies</span>}
      </div>

      <div className="h-full">
        <ul className="mt-4">
          {[
            { icon: <FaTachometerAlt className="text-lg" />, text: "Dashboard", onClick: () => DashboardNavigate(navigate) },
            { icon: <FaUsers className="text-lg" />, text: "Users", onClick: () => UsersNavigate(navigate) },
            { icon: <FaPaw className="text-lg" />, text: "WanderPets Registry", onClick: () => WanderPetsRegistryNavigate(navigate), notifKey: "Registry" },
            { icon: <FaHandHoldingHeart className="text-lg" />, text: "Pets Adoption", onClick: () => PetsAdoption(navigate) },
            { icon: <FaClipboardList className="text-lg" />, text: "Adoption Application", onClick: () => AdoptionRequest(navigate), notifKey: "Adoption Request" },
            { icon: <FaHandsHelping className="text-lg" />, text: "Rescue Request", onClick: () => RescueRequest(navigate), notifKey: "Rescue Request" },
            { icon: <FaHistory className="text-lg" />, text: "History", onClick: () => History(navigate), notifKey: "History" },
            { icon: <FaFileUpload className="text-lg" />, text: "Upload Articles/Clinic", onClick: () => UploadArticlesVet(navigate) },
            { icon: <FaSignOutAlt className="text-lg" />, text: "Logout", onClick: () => handleLogout(navigate) },
          ].map((item, index) => (
            <li key={index} className="relative group p-6 hover:bg-green-700 cursor-pointer flex items-center whitespace-nowrap" onClick={item.onClick}>
              <div className="relative">
                {item.icon}
                {item.notifKey && notifications[item.notifKey] > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {notifications[item.notifKey]}
                  </span>
                )}
              </div>
              {isOpen && <span className="ml-4">{item.text}</span>}
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
