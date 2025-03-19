import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import AppSideBar from '../components/AppSideBar';
import { updateDoc, serverTimestamp, setDoc } from "firebase/firestore";

const ViewProfile = () => {
  const { collectionName, id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [personnel, setPersonnel] = useState("");
  const [rescuer, setRescuer] = useState("");


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

  const updateApplicationStatus = async (newStatus, personnel) => {
  
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
  
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        console.error("Document does not exist.");
        return;
      }
  
      const petData = docSnap.data();
  
      // Update application status and viewed status
      await updateDoc(docRef, {
        applicationStatus: newStatus,
        statusChange: serverTimestamp(),
        viewed: "NO", // Mark as not viewed
      });
  
      // If status changes from APPROVED to COMPLETED, move pet to "adopted" collection
      if (petData.applicationStatus === "APPROVED" && newStatus === "COMPLETED") {
        const adoptedDocRef = doc(db, "adopted", id); // Use the same ID
  
        await setDoc(adoptedDocRef, {
          name: petData.name || "N/A",
          age: petData.age || "N/A",
          petType: petData.petType || "N/A",
          breed: petData.breed || "N/A",
          gender: petData.gender || "N/A",
          size: petData.size || "N/A",
          description: petData.description || "N/A",
          petPicture: petData.petPicture || "",
          vaccination: petData.vaccination || "",
          spay: petData.spay || "",
          medical: petData.medical || "",
          timestamp: serverTimestamp(),
          additionalPhotos: petData.additionalPhotos || "",
        });
  
        alert("Pet details have been added to the adopted collection.");
      }
  
      setPet((prev) => ({
        ...prev,
        applicationStatus: newStatus,
        viewed: "NO",
        personnel, // Ensure personnel updates in state
      }));
  
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateReportStatus = async (newStatus, rescuer) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
  
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        console.error("Document does not exist.");
        return;
      }
  
      // Update Firestore with new status and reset viewed
      const updateData = {
        reportStatus: newStatus,
        statusChange: serverTimestamp(),
        viewed: "NO",
      };
  
      if (newStatus === "RESCUED") {
        updateData.rescuer = rescuer || ""; // Save rescuer's name
        updateData.rescueDate = serverTimestamp();
      }
  
      await updateDoc(docRef, updateData);
  
      // Update state
      setPet((prev) => ({
        ...prev,
        reportStatus: newStatus,
        rescuer: newStatus === "RESCUED" ? rescuer : prev.rescuer,
        viewed: "NO",
      }));
  
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <AppSideBar />
      {/* Pet Info */}
      {["missing", "wandering", "found"].includes(collectionName) && (
  <>
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
  </>
)}

      {/* Found Pet Details */}
      {collectionName === "found" && pet.foundAt && pet.foundBy && pet.foundOn && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h2 className="text-2xl font-semibold">Found Pet Information</h2>
          <p><strong>Found At:</strong> {pet.foundAt}</p>
          <p><strong>Found By:</strong> {pet.foundBy}</p>
          <p><strong>Found On:</strong> {formatDate(pet.foundOn)}</p>
        </div>
      )}

{["adoption", "adopted"].includes(collectionName) && (
  <>
    <div className="flex flex-col md:flex-row">
      <div className="flex-shrink-0">
        <img
          src={pet.petPicture || "https://via.placeholder.com/200"}
          alt={pet.name}
          className="w-48 h-48 object-cover rounded-lg shadow-md"
        />
      </div>
      <div className="md:ml-6 mt-4 md:mt-0">
        <h1 className="text-3xl font-bold">{pet.name}</h1>
        <p className="text-gray-700">{pet.description || "No description provided."}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-gray-800">
          <p><strong>Age:</strong> {pet.age || "N/A"}</p>
          <p><strong>Breed:</strong> {pet.breed || "N/A"}</p>
          <p><strong>Gender:</strong> {pet.gender || "N/A"}</p>
          <p><strong>Type:</strong> {pet.petType || "N/A"}</p>
          <p><strong>Size:</strong> {pet.size || "N/A"}</p>
          <p><strong>Posted On:</strong> {formatDate(pet.timestamp)}</p>
        </div>
      </div>
    </div>

    {pet.additionalPhotos?.length > 0 && (
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Additional Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {pet.additionalPhotos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Additional ${index + 1}`}
              className="w-full h-32 object-cover rounded-md shadow cursor-pointer"
              onClick={() => window.open(photo, "_blank")}
            />
          ))}
        </div>
      </div>
    )}

    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-2">Medical Information</h2>
      <div className="flex space-x-4">
        {["medical", "spay", "vaccination"].map(
          (field) =>
            pet[field] && (
              <img
                key={field}
                src={pet[field]}
                alt={field}
                className="w-32 h-32 object-cover rounded-md shadow cursor-pointer"
                onClick={() => window.open(pet[field], "_blank")}
              />
            )
        )}
      </div>
    </div>
  </>
)}

{collectionName === "adoptionApplication" && (
  <>
    <h1 className="text-3xl font-bold mb-4">Adoption Application</h1>
    <p><strong> {pet.transactionNumber || "N/A"}</strong></p>

    {/* Applicant Details */}
<div className="mt-6 p-6 bg-gray-100 shadow-md rounded-lg flex flex-wrap md:flex-nowrap">

  {/* Left Side: Applicant Info */}
  <div className="md:w-2/3 pr-6">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Applicant Details</h2>
    <p><strong>Name:</strong> {pet.firstName} {pet.lastName}</p>
    <p><strong>Pronouns:</strong> {pet.pronouns || "N/A"}</p>
    <p><strong>Status:</strong> {pet.status || "N/A"}</p>
    <p><strong>Company:</strong> {pet.company || "N/A"}</p>
    <p><strong>Occupation:</strong> {pet.occupation || "N/A"}</p>
    <p><strong>Address:</strong> {pet.address}, {pet.city}</p>
    <p><strong>Email:</strong> {pet.email || "N/A"}</p>
    <p><strong>Phone:</strong> {pet.phoneNumber || "N/A"}</p>
  </div>

  {/* Right Side: Profile Picture & Valid ID */}
  <div className="md:w-1/3 flex flex-col items-end">
    {pet.profilePicture && (
      <a href={pet.profilePicture} target="_blank" rel="noopener noreferrer">
        <img src={pet.profilePicture} alt="Profile" className="w-44 h-44 object-cover rounded-full shadow-md mb-4" />
      </a>
    )}
    {pet.validID && (
      <a href={pet.validID} target="_blank" rel="noopener noreferrer">
        <img src={pet.validID} alt="Valid ID" className="w-36 h-36 object-cover rounded shadow-md" />
      </a>
    )}
  </div>
</div>

{/* Home Photos Container */}
{pet.homePhotos && pet.homePhotos.length > 0 && (
  <div className="mt-6 p-6 bg-white shadow-md rounded-lg">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Home Photos</h2>
    <div className="flex flex-wrap justify-center gap-4">
      {pet.homePhotos.map((photo, index) => (
        <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
          <img src={photo} alt={`Home Photo ${index + 1}`} className="w-48 h-36 object-cover rounded shadow-md" />
        </a>
      ))}
    </div>
  </div>
)}
    {/* Interview Questions */}
    <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Interview Questions</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "How many hours in an average workday will your pet be left alone?", field: "workHours" },
          { label: "Do you have other pets?", field: "otherPets" },
          { label: "Have you adopted from Supremo Furbabies before?", field: "previouslyAdopted" },
          { label: "Have you had pets in the past?", field: "pastPets" },
          { label: "Meet Ups?", field: "meet" },
          { label: "Who will be financially responsible for your pet’s needs?", field: "responsibleFinancial" },
          { label: "Who will be responsible for feeding, grooming, and generally caring for your pet?", field: "responsibleGrooming" },
          { label: "What is his/her monthly salary range?", field: "salaryRange" },
          { label: "What happens to your pet if or when you move?", field: "move" },
          { label: "Describe your ideal Pet:", field: "idealPet", textarea: true }
        ].map(({ label, field, textarea }) => (
          <div key={field} className="flex flex-col">
            <label className="font-medium text-gray-700">{label}</label>
            {textarea ? (
              <textarea 
                className="mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                value={pet[field] || "N/A"} 
                readOnly
              />
            ) : (
              <input 
                type="text" 
                className="mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                value={pet[field] || "N/A"} 
                readOnly
              />
            )}
          </div>
        ))}
      </form>
    </div>

    {/* Contact Person Information */}
    <div className="mt-4 p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Contact Person Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
        {[
          { label: "First Name", field: "contactFirstName" },
          { label: "Last Name", field: "contactLastName" },
          { label: "Email", field: "contactEmail" },
          { label: "Phone Number", field: "contactPhone" },
          { label: "Relationship", field: "contactRelationship" }
        ].map(({ label, field }) => (
          <p key={field} className="text-gray-700">
            <strong className="text-gray-900">{label}:</strong> {pet[field] || "N/A"}
          </p>
        ))}
      </div>
    </div>

    {/* Pet Details */}
<div className="mt-6 p-6 bg-white shadow-md rounded-lg flex flex-wrap md:flex-nowrap">
  {/* Left Side: Pet Info */}
  <div className="md:w-2/3 pr-6">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pet Details</h2>
    <p><strong>Pet ID:</strong> {pet.petId || "N/A"}</p>
    <p><strong>Name:</strong> {pet.name || "N/A"}</p>
    <p><strong>Age:</strong> {pet.age || "N/A"}</p>
    <p><strong>Type:</strong> {pet.petType || "N/A"}</p>
    <p><strong>Breed:</strong> {pet.breed || "N/A"}</p>
    <p><strong>Gender:</strong> {pet.gender || "N/A"}</p>
    <p><strong>Size:</strong> {pet.size || "N/A"}</p>
    <p><strong>Description:</strong> {pet.description || "N/A"}</p>
  </div>

  {/* Right Side: Pet Picture */}
  <div className="md:w-1/3 flex justify-end">
    {pet.petPicture && (
      <a href={pet.petPicture} target="_blank" rel="noopener noreferrer">
        <img src={pet.petPicture} alt="Pet" className="w-52 h-52 object-cover rounded-lg shadow-md" />
      </a>
    )}
  </div>
</div>

{/* Medical Records */}
{(pet.vaccination || pet.spay || pet.medical) && (
  <div className="mt-6 p-6 bg-white shadow-md rounded-lg">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Medical Records</h2>
    <div className="flex flex-wrap justify-center gap-6">
      {pet.vaccination && (
        <a href={pet.vaccination} target="_blank" rel="noopener noreferrer">
          <img src={pet.vaccination} alt="Vaccination Record" className="w-48 h-36 object-cover rounded shadow-md" />
        </a>
      )}
      {pet.spay && (
        <a href={pet.spay} target="_blank" rel="noopener noreferrer">
          <img src={pet.spay} alt="Spay Record" className="w-48 h-36 object-cover rounded shadow-md" />
        </a>
      )}
      {pet.medical && (
        <a href={pet.medical} target="_blank" rel="noopener noreferrer">
          <img src={pet.medical} alt="Medical Record" className="w-48 h-36 object-cover rounded shadow-md" />
        </a>
      )}
    </div>
  </div>
)}

    {/* Application Status */}
    <div className="mt-6 p-6 bg-gray-200 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3">Application Status</h2>
      <p><strong>Current Status:</strong> {pet.applicationStatus || "PENDING"}</p>
      <p><strong>Last Updated:</strong> {formatDate(pet.statusChange)}</p>

      {/* Remarks input field for all statuses except REJECTED */}
      {pet.applicationStatus !== "REJECTED" && (
        <div className="mt-3">
          <label className="block font-semibold">Remarks (Optional):</label>
          <textarea 
            className="w-full mt-1 p-2 border rounded"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      )}

      {/* Additional fields for APPROVED status */}
      {pet.applicationStatus === "APPROVED" && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Adoption Date:</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border rounded bg-gray-100" 
              value={new Date().toLocaleString()} 
              readOnly 
            />
          </div>
          <div>
            <label className="block font-semibold">Personnel (Required):</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border rounded"
              value={personnel}
              onChange={(e) => setPersonnel(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        {pet.applicationStatus === "PENDING" && (
          <button 
            className="px-4 py-2 text-white bg-blue-500 rounded" 
            onClick={() => updateApplicationStatus("REVIEWING")}
          >
            Start Reviewing
          </button>
        )}
        {pet.applicationStatus === "REVIEWING" && (
          <>
            <button 
              className="px-4 py-2 text-white bg-green-500 rounded" 
              onClick={() => updateApplicationStatus("APPROVED")}
            >
              Approve
            </button>
            <button 
              className="px-4 py-2 text-white bg-red-500 rounded" 
              onClick={() => updateApplicationStatus("REJECTED")}
            >
              Reject
            </button>
          </>
        )}
        {pet.applicationStatus === "APPROVED" && (
          <button 
            className="px-4 py-2 text-white bg-purple-500 rounded" 
            onClick={() => updateApplicationStatus("COMPLETED")}
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  </>
)}
  {collectionName === "rescue" && pet && (
  <div className="mt-6 p-6 bg-white shadow-md rounded-lg">
    {/* Report Info Section */}
    <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
      {/* Profile Picture (Left Side) */}
      {pet.profilePicture && (
        <div className="w-48 h-48 flex-shrink-0">
          <a href={pet.profilePicture} target="_blank" rel="noopener noreferrer">
            <img src={pet.profilePicture} alt="Profile" className="w-full h-full object-cover rounded shadow-md" />
          </a>
        </div>
      )}
      
      {/* Report Details */}
      <div className="flex-grow">
        <p className="text-lg font-semibold">Transaction Number: {pet.transactionNumber || "N/A"}</p>
        <p className="text-gray-600">Status: {pet.reportStatus || "N/A"}</p>
        <p><strong>Timestamp:</strong> {pet.timestamp?.seconds ? new Date(pet.timestamp.seconds * 1000).toLocaleString() : "N/A"}</p>
        <p><strong>Name:</strong> {pet.firstName} {pet.lastName}</p>
        <p><strong>Email:</strong> {pet.email || "N/A"}</p>
        <p><strong>Phone:</strong> {pet.phoneNumber || "N/A"}</p>
        <p><strong>Address:</strong> {pet.address || "N/A"}</p>
      </div>
    </div>

    {/* Pet Info Section */}
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pet Details</h2>
      
      {/* Pet Picture (Centered) */}
      {pet.petPicture && (
        <div className="flex justify-center mb-4">
          <a href={pet.petPicture} target="_blank" rel="noopener noreferrer">
            <img src={pet.petPicture} alt="Pet" className="w-64 h-64 object-cover rounded shadow-md" />
          </a>
        </div>
      )}

      <p><strong>Age:</strong> {pet.age || "N/A"}</p>
      <p><strong>Breed:</strong> {pet.breed || "N/A"}</p>
      <p><strong>City:</strong> {pet.city || "N/A"}</p>
      <p><strong>Gender:</strong> {pet.gender || "N/A"}</p>
      <p><strong>Type:</strong> {pet.petType || "N/A"}</p>
      <p><strong>Size:</strong> {pet.size || "N/A"}</p>
      <p><strong>Street Number:</strong> {pet.streetNumber || "N/A"}</p>
      <p><strong>Description:</strong> {pet.description || "N/A"}</p>
      <p><strong>Note:</strong> {pet.note || "N/A"}</p>
      
      {/* Additional Photos */}
      {Array.isArray(pet.additionalPhotos) && pet.additionalPhotos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Additional Photos</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {pet.additionalPhotos.map((photo, index) => (
              <a href={photo} target="_blank" rel="noopener noreferrer" key={index}>
                <img src={photo} alt={`Additional Photo ${index + 1}`} className="w-48 h-48 object-cover rounded shadow-md" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Status Buttons */}
    <div className="mt-6">
      {pet.reportStatus === "PENDING" && (
        <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => updateReportStatus("REVIEWING")}>Set to Reviewing</button>
      )}
      {pet.reportStatus === "REVIEWING" && (
        <>
          <button className="bg-green-500 text-white py-2 px-4 rounded mr-4" onClick={() => updateReportStatus("ONGOING")}>Set to Ongoing</button>
          <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={() => updateReportStatus("DECLINED")}>Set to Declined</button>
        </>
      )}
      {pet.reportStatus === "ONGOING" && (
        <>
          <input
            type="text"
            placeholder="Enter rescuer name"
            value={rescuer}
            onChange={(e) => setRescuer(e.target.value)}
            className="border p-2 rounded mt-4"
            required
          />
          <button className="bg-green-500 text-white py-2 px-4 rounded mt-4" onClick={() => updateReportStatus("RESCUED")}>Set to Rescued</button>
        </>
      )}
    </div>

    {/* Remarks */}
    <div className="mt-6">
      <textarea
        placeholder="Optional remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="w-full border rounded p-2"
      />
    </div>
  </div>
)}
      
    </div>
  );
};

export default ViewProfile;
    