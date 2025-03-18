import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import AppSideBar from '../components/AppSideBar';

const ViewProfile = () => {
  const { collectionName, id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionName || !id) {
      console.error("Invalid collection name or ID");
      navigate("/");
      return;
    }

    const fetchPetDetails = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPet(docSnap.data());
        } else {
          console.error("No such document!");
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetDetails();
  }, [collectionName, id, navigate]);

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (!pet) return <div className="text-center mt-10 text-lg">Pet not found.</div>;

  // Format timestamp
  const formatDate = (timestamp) => {
    return timestamp
      ? new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      : "N/A";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <AppSideBar />
      {/* Pet Info */}
      <div className="flex flex-col md:flex-row">
        {/* Pet Image */}
        <div className="flex-shrink-0">
          <img
            src={pet.petPicture || "https://via.placeholder.com/200"}
            alt={pet.name}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Pet Details */}
        <div className="md:ml-6 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold">{pet.name}</h1>
          <p className="text-gray-700">{pet.description || "No description provided."}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-gray-800">
            <p><strong>Age:</strong> {pet.age || "N/A"}</p>
            <p><strong>Breed:</strong> {pet.breed || "N/A"}</p>
            <p><strong>Gender:</strong> {pet.gender || "N/A"}</p>
            <p><strong>Type:</strong> {pet.petType || "N/A"}</p>
            <p><strong>Size:</strong> {pet.size || "N/A"}</p>
            <p><strong>Status:</strong> {pet.postType || "N/A"}</p>
            <p><strong>Posted On:</strong> {formatDate(pet.timestamp)}</p>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      {pet.media && pet.media.length > 0 && (
        <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">Media</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pet.media.map((item, index) => (
                <div key={index} className="relative w-full h-32 rounded-md shadow overflow-hidden">
                {item.type === "image" ? (
                    <img
                    src={item.uri}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                    />
                ) : item.type === "video" ? (
                    <video controls className="w-full h-full object-cover">
                    <source src={item.uri} type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>
                ) : (
                    <p className="text-sm text-red-500">Unsupported media type</p>
                )}
                </div>
            ))}
            </div>
        </div>
        )}
      {/* Author Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold">Owner Information</h2>
        <div className="flex items-center mt-4">
          <img
            src={pet.profilePicture || "https://via.placeholder.com/100"}
            alt="Owner"
            className="w-20 h-20 rounded-full object-cover shadow"
          />
          <div className="ml-4">
            <p className="text-lg font-bold">{pet.firstName} {pet.lastName}</p>
            <p className="text-gray-700">{pet.address}, {pet.city}</p>
            {pet.note && <p className="text-gray-500 italic">"{pet.note}"</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Email:</strong> {pet.email || "N/A"}</p>
          <p><strong>Phone:</strong> {pet.phoneNumber || "N/A"}</p>
        </div>
      </div>

      {/* Found Pet Details */}
      {collectionName === "found" && pet.foundAt && pet.foundBy && pet.foundOn && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h2 className="text-2xl font-semibold">Found Pet Information</h2>
          <p><strong>Found At:</strong> {pet.foundAt}</p>
          <p><strong>Found By:</strong> {pet.foundBy}</p>
          <p><strong>Found On:</strong> {formatDate(pet.foundOn)}</p>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
    