import React, { useState, useEffect } from "react";
import AppSideBar from '../components/AppSideBar';
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const UserProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPets, setUserPets] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details
        const usersSnapshot = await getDocs(
          query(collection(db, "users"), where("email", "==", email))
        );

        if (!usersSnapshot.empty) {
          setUser(usersSnapshot.docs[0].data());
        }

        // Fetch pets from userPets collection
        const userPetsSnapshot = await getDocs(
          query(collection(db, "userPets"), where("email", "==", email))
        );
        setUserPets(userPetsSnapshot.docs.map((doc) => doc.data()));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [email]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AppSideBar />
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-gray-600"
      >
        Back
      </button>

      {/* User Profile Container */}
      {user ? (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center border border-gray-300">
          <img
            src={user.profilePicture || "https://via.placeholder.com/100"} 
            alt="Profile"
            className="w-24 h-24 rounded-full border border-gray-300 mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-gray-800">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phoneNumber}</p>
          <p className="text-gray-600">{user.address}</p>
          <p className="text-gray-500 text-sm mt-2">
            Joined: {user.createdAt
              ? new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  timeStyle: "medium",
                  timeZone: "Asia/Manila",
                }).format(new Date(user.createdAt.seconds * 1000))
              : "Unknown"}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-600">Loading user data...</p>
      )}

      {/* User Pets Section */}
      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Posted Pets</h2>
      {userPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userPets.map((pet, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 border border-gray-300 flex flex-col items-center text-center">
              <img
                src={pet.profilePicture || "https://via.placeholder.com/100"}
                alt={pet.name}
                className="w-24 h-24 rounded-full border border-gray-300 mb-3 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
              <p className="text-gray-600">{pet.petType} - {pet.breed}</p>
              <p className="text-gray-600">Size: {pet.size} | Age: {pet.age}</p>
              <p className="text-gray-600">Gender: {pet.gender}</p>
              <p className="text-gray-500 text-sm mt-2">{pet.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No pets posted.</p>
      )}
    </div>
  );
};

export default UserProfile;
