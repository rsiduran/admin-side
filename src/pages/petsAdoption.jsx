import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faFilter,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const storage = getStorage();
const PetsAdoption = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "0-11 months",
    breed: "",
    petPicture: null,
    additionalPhotos: [],
    description: "",
    gender: "Male",
    medical: null,
    spay: null,
    vaccination: null,
    size: "Small",
    petType: "Dog",
  });

  // Filter states
  const [adoptionRecords, setAdoptionRecords] = useState([]);
  const [adoptedRecords, setAdoptedRecords] = useState([]);
  const [adoptionSearch, setAdoptionSearch] = useState("");
  const [adoptedSearch, setAdoptedSearch] = useState("");
  const [adoptionPage, setAdoptionPage] = useState(1);
  const [adoptedPage, setAdoptedPage] = useState(1);
  const rowsPerPage = 5;

  // Column filters
  const [adoptionFilters, setAdoptionFilters] = useState({
    name: "",
    breed: "",
    petType: "",
    size: "",
    showFilters: false,
  });

  const [adoptedFilters, setAdoptedFilters] = useState({
    name: "",
    breed: "",
    petType: "",
    size: "",
    showFilters: false,
  });

  // Breed options by pet type
  const breedsByType = {
    Dog: [
      "Unknown",
      "Aspin",
      "Beagle",
      "Bulldog",
      "Chihuahua",
      "Dachshund",
      "German Shepherd",
      "Golden Retriever",
      "Labrador Retriever",
      "Maltese",
      "Pomeranian",
      "Poodle",
      "Pug",
      "Rottweiler",
      "Shih Tzu",
      "Siberian Husky",
      "Welsh Corgi",
      "Others",
    ],
    Cat: [
      "Unknown",
      "Abyssinian",
      "Bengal",
      "Burmese",
      "Persian",
      "Puspin",
      "Ragdoll",
      "Russian Blue",
      "Scottish Fold",
      "Siamese",
      "Sphynx",
      "Others",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
  
    if (name === "additionalPhotos") {
      const newPhotos = Array.from(files).map(file => ({
        type: "image",
        uri: file  // Store File object temporarily, will be replaced with URL on submit
      }));
      
      setFormData(prev => ({
        ...prev,
        additionalPhotos: [...prev.additionalPhotos, ...newPhotos]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: files.length > 0 ? files[0] : null,
      }));
    }
  };
  
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validate required fields
      if (!formData.petPicture) {
        toast.error("Please upload a pet picture!");
        setLoading(false);
        return;
      }
  
      // Upload pet picture (returns just the URL string)
      const petPicture = formData.petPicture instanceof File
        ? await uploadFile(formData.petPicture, "petPictures")
        : formData.petPicture;
  
      // Upload additional photos (structured format)
      const additionalPhotos = await Promise.all(
        formData.additionalPhotos.map(async photo => {
          if (photo.uri instanceof File) {
            return {
              type: "image",
              uri: await uploadFile(photo.uri, "additionalPhotos")
            };
          }
          return photo; // Keep existing photo objects
        })
      );
  
      // Upload documents (returns just the URL strings)
      const uploadDocument = async (file, folder) => {
        if (!file) return null;
        return file instanceof File ? await uploadFile(file, folder) : file;
      };
  
      const medical = await uploadDocument(formData.medical, "medical");
      const spay = await uploadDocument(formData.spay, "spay");
      const vaccination = await uploadDocument(formData.vaccination, "vaccination");
  
      // Prepare final data
      const petData = {
        name: formData.name,
        age: formData.age,
        breed: formData.breed,
        petPicture, // Just the URL string
        additionalPhotos: additionalPhotos.filter(photo => photo.uri), // Structured format
        description: formData.description,
        gender: formData.gender,
        medical, // Just the URL string
        spay, // Just the URL string
        vaccination, // Just the URL string
        size: formData.size,
        petType: formData.petType,
        timestamp: editingPetId ? formData.timestamp : new Date(),
      };
  
      // Save to Firestore
      if (editingPetId) {
        await updateDoc(doc(db, "adoption", editingPetId), petData);
        toast.success("Pet updated successfully!");
      } else {
        await addDoc(collection(db, "adoption"), petData);
        toast.success("Pet added successfully!");
      }
  
      // Reset form
      setShowModal(false);
      setEditingPetId(null);
      setFormData({
        name: "",
        age: "0-11 months",
        breed: "",
        petPicture: null,
        additionalPhotos: [],
        description: "",
        gender: "Male",
        medical: null,
        spay: null,
        vaccination: null,
        size: "Small",
        petType: "Dog",
      });
      fetchRecords();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred!");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (pet) => {
    setFormData({
      name: pet.name ?? "",
      age: pet.age ?? "",
      breed: pet.breed ?? "",
      petPicture: pet.petPicture ?? null, // Just the URL string
      additionalPhotos: Array.isArray(pet.additionalPhotos) 
        ? pet.additionalPhotos.map(photo => ({
            type: photo?.type || "image",
            uri: photo?.uri || null
          }))
        : [],
      description: pet.description ?? "",
      gender: pet.gender ?? "Male",
      medical: pet.medical ?? null,
      spay: pet.spay ?? null,
      vaccination: pet.vaccination ?? null,
      size: pet.size ?? "Small",
      petType: pet.petType ?? "Dog",
      timestamp: pet.timestamp ?? new Date(),
    });
    setEditingPetId(pet.id);
    setShowModal(true);
  };
  const fetchRecords = async () => {
    try {
      const [adoptionQuery, adoptedQuery] = await Promise.all([
        getDocs(
          query(collection(db, "adoption"), orderBy("timestamp", "desc"))
        ),
        getDocs(query(collection(db, "adopted"), orderBy("timestamp", "desc"))),
      ]);

      setAdoptionRecords(
        adoptionQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data()?.timestamp?.toDate().toLocaleString() || "N/A",
        }))
      );

      setAdoptedRecords(
        adoptedQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data()?.timestamp?.toDate().toLocaleString() || "N/A",
        }))
      );
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to load records");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter and pagination logic
  const filterRecords = (records, searchTerm, filters) => {
    return records.filter((record) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(record).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesName =
        filters.name === "" ||
        (record.name &&
          record.name.toLowerCase().includes(filters.name.toLowerCase()));

      const matchesBreed =
        filters.breed === "" ||
        (record.breed &&
          record.breed.toLowerCase().includes(filters.breed.toLowerCase()));

      const matchesPetType =
        filters.petType === "" ||
        (record.petType &&
          record.petType.toLowerCase() === filters.petType.toLowerCase());

      const matchesSize =
        filters.size === "" ||
        (record.size &&
          record.size.toLowerCase() === filters.size.toLowerCase());

      return (
        matchesSearch &&
        matchesName &&
        matchesBreed &&
        matchesPetType &&
        matchesSize
      );
    });
  };

  const paginateRecords = (records, page) => {
    const indexOfLastRow = page * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return {
      currentRows: records.slice(indexOfFirstRow, indexOfLastRow),
      totalPages: Math.ceil(records.length / rowsPerPage),
    };
  };

  const filteredAdoption = filterRecords(
    adoptionRecords,
    adoptionSearch,
    adoptionFilters
  );
  const { currentRows: adoptionCurrentRows, totalPages: adoptionTotalPages } =
    paginateRecords(filteredAdoption, adoptionPage);

  const filteredAdopted = filterRecords(
    adoptedRecords,
    adoptedSearch,
    adoptedFilters
  );
  const { currentRows: adoptedCurrentRows, totalPages: adoptedTotalPages } =
    paginateRecords(filteredAdopted, adoptedPage);

  const resetFilters = (isAdoption) => {
    if (isAdoption) {
      setAdoptionFilters({
        name: "",
        breed: "",
        petType: "",
        size: "",
        showFilters: false,
      });
      setAdoptionSearch("");
    } else {
      setAdoptedFilters({
        name: "",
        breed: "",
        petType: "",
        size: "",
        showFilters: false,
      });
      setAdoptedSearch("");
    }
  };

  const getAllBreeds = () => {
    const allBreeds = new Set();
    adoptionRecords.forEach((pet) => {
      if (pet.breed) allBreeds.add(pet.breed);
    });
    adoptedRecords.forEach((pet) => {
      if (pet.breed) allBreeds.add(pet.breed);
    });
    return Array.from(allBreeds).sort();
  };

  // Add these to your existing state declarations
  const [availableBreeds, setAvailableBreeds] = useState([]);

  // Update available breeds when pet type changes
  useEffect(() => {
    if (adoptionFilters.petType && breedsByType[adoptionFilters.petType]) {
      setAvailableBreeds(breedsByType[adoptionFilters.petType]);
      // Reset breed filter if it's not compatible with the new pet type
      if (
        !breedsByType[adoptionFilters.petType].includes(adoptionFilters.breed)
      ) {
        setAdoptionFilters((prev) => ({ ...prev, breed: "" }));
      }
    } else {
      setAvailableBreeds([]);
      setAdoptionFilters((prev) => ({ ...prev, breed: "" }));
    }
  }, [adoptionFilters.petType]);

  const [availableAdoptedBreeds, setAvailableAdoptedBreeds] = useState([]);

  useEffect(() => {
    if (adoptedFilters.petType && breedsByType[adoptedFilters.petType]) {
      setAvailableAdoptedBreeds(breedsByType[adoptedFilters.petType]);
      if (
        !breedsByType[adoptedFilters.petType].includes(adoptedFilters.breed)
      ) {
        setAdoptedFilters((prev) => ({ ...prev, breed: "" }));
      }
    } else {
      setAvailableAdoptedBreeds([]);
      setAdoptedFilters((prev) => ({ ...prev, breed: "" }));
    }
  }, [adoptedFilters.petType]);

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Pets Adoption</h1>

        {/* Adoption Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pets Available for Adoption
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Pet for Adoption
          </button>
          {/* Modal */}
          {showModal && (
            <div
              style={{
                background: "rgba(0, 0, 0, 0.5)", // Transparent black overlay
                boxShadow: "0 4px 10px rgba(0, 0, 0, 1)", // Strong black shadow
              }}
              className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-lg p-6 w-230">
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ClipLoader
                      size={80}
                      width={5}
                      color="#4fa94d"
                      loading={loading}
                    />
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="max-w-4xl mx-auto p-4" // Limit width to make the form wider
                  >
                    {/* Form Heading */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Add Pet for Adoption
                    </h3>

                    {/* Name and Age Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Pet Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter pet's name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="age"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Age
                        </label>
                        <select
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        >
                          <option value="0-11 months">0-11 months</option>
                          <option value="1-5 years">1-5 years</option>
                          <option value="6 years and up">6 years and up</option>
                        </select>
                      </div>
                    </div>

                    {/* Breed and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                      <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mt-3">
                        Breed
                      </label>
                      {formData.petType === "Dog" ? (
                        <select
                          id="breed"
                          name="breed"
                          value={formData.breed}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          required
                        >
                          <option value="">Select dog breed</option>
                          {["Unknown", "Aspin", "Beagle", "Bulldog", "Chihuahua", "Dachshund", "German Shepherd",
                            "Golden Retriever", "Labrador Retriever", "Maltese", "Pomeranian",
                            "Poodle", "Pug", "Rottweiler", "Shih Tzu", "Siberian Husky", "Welsh Corgi", "Others"].map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      ) : formData.petType === "Cat" ? (
                        <select
                          id="breed"
                          name="breed"
                          value={formData.breed}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          required
                        >
                          <option value="">Select cat breed</option>
                          {["Unknown", "Abyssinian", "Bengal", "Burmese", "Persian", "Puspin",
                            "Ragdoll", "Russian Blue", "Scottish Fold", "Siamese", "Sphynx", "Others"].map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          id="breed"
                          name="breed"
                          disabled
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-400"
                        >
                          <option value="">Please select pet type first</option>
                        </select>
                      )}
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          placeholder="Provide a description"
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          rows="2" // Reduce height of the textarea
                          required
                        ></textarea>
                      </div>
                    </div>

                    {/* Gender, Size, and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="gender"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="size"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Size
                        </label>
                        <select
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        >
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>
                      <div>
                      <label htmlFor="petType" className="block text-sm font-medium text-gray-700">
                        Pet Type
                      </label>
                      <select
                        id="petType"
                        name="petType"
                        value={formData.petType}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                      >
                        <option value="">Select pet type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <fieldset className="mb-4 border-t border-gray-300 pt-2">
                      <legend className="text-lg font-medium text-gray-700">
                        Upload Files
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="petPicture"
                            className="block text-gray-700 font-medium mb-1"
                          >
                            Pet Picture
                          </label>
                          <input
                            type="file"
                            id="petPicture"
                            name="petPicture"
                            onChange={handleFileChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            accept="image/*"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="additionalPhotos"
                            className="block text-gray-700 font-medium mb-1"
                          >
                            Additional Photos
                          </label>
                          <input
                            type="file"
                            id="additionalPhotos"
                            name="additionalPhotos"
                            onChange={handleFileChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            accept="image/*"
                            multiple
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="medical"
                            className="block text-gray-700 font-medium mb-1"
                          >
                            Medical Records
                          </label>
                          <input
                            type="file"
                            id="medical"
                            name="medical"
                            onChange={handleFileChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            accept="image/*"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="spay"
                            className="block text-gray-700 font-medium mb-1"
                          >
                            Spay Certificate
                          </label>
                          <input
                            type="file"
                            id="spay"
                            name="spay"
                            onChange={handleFileChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            accept="image/*"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="vaccination"
                            className="block text-gray-700 font-medium mb-1"
                          >
                            Vaccination Records
                          </label>
                          <input
                            type="file"
                            id="vaccination"
                            name="vaccination"
                            onChange={handleFileChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            accept="image/*"
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          {/* Search and Filter Controls */}
          <div className="mb-4 flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search adoption records..."
                value={adoptionSearch}
                onChange={(e) => {
                  setAdoptionSearch(e.target.value);
                  setAdoptionPage(1);
                }}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
              />
              <button
                onClick={() =>
                  setAdoptionFilters((prev) => ({
                    ...prev,
                    showFilters: !prev.showFilters,
                  }))
                }
                className={`px-4 py-2 rounded-lg shadow flex items-center ${
                  adoptionFilters.showFilters
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={adoptionFilters.showFilters ? faTimes : faFilter}
                  className="mr-2"
                />
                {adoptionFilters.showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button
                onClick={() => resetFilters(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>

            {/* Column Filters */}
            {adoptionFilters.showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={adoptionFilters.name}
                    onChange={(e) =>
                      setAdoptionFilters((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Type
                  </label>
                  <select
                    value={adoptionFilters.petType}
                    onChange={(e) =>
                      setAdoptionFilters((prev) => ({
                        ...prev,
                        petType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <select
                    value={adoptionFilters.breed}
                    onChange={(e) =>
                      setAdoptionFilters((prev) => ({
                        ...prev,
                        breed: e.target.value,
                      }))
                    }
                    disabled={!adoptionFilters.petType}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm disabled:opacity-50"
                  >
                    <option value="">All Breeds</option>
                    {availableBreeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    value={adoptionFilters.size}
                    onChange={(e) =>
                      setAdoptionFilters((prev) => ({
                        ...prev,
                        size: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">All Sizes</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
            <table className="table-auto w-full text-sm text-gray-800">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Breed</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Size</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adoptionCurrentRows.length > 0 ? (
                  adoptionCurrentRows.map((record) => (
                    <tr
                      key={record.id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                    >
                      <td className="px-6 py-3 text-left">{record.name}</td>
                      <td className="px-6 py-3 text-left">{record.breed}</td>
                      <td className="px-6 py-3 text-left">{record.petType}</td>
                      <td className="px-6 py-3 text-left">{record.age}</td>
                      <td className="px-6 py-3 text-left">{record.size}</td>
                      <td className="px-6 py-3 text-left">
                        {record.timestamp}
                      </td>
                      <td className="px-6 py-3 text-left">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/view-profile/adoption/${record.id}`)
                            }
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-4 text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex space-x-2">
            {Array.from(
              { length: adoptionTotalPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setAdoptionPage(pageNumber)}
                className={`px-4 py-2 border rounded-lg ${
                  adoptionPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } hover:bg-blue-100`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Adopted Table */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Adopted Pets
          </h2>
          {/* Search and Filter Controls */}
          <div className="mb-4 flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search adopted records..."
                value={adoptedSearch}
                onChange={(e) => {
                  setAdoptedSearch(e.target.value);
                  setAdoptedPage(1);
                }}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
              />
              <button
                onClick={() =>
                  setAdoptedFilters((prev) => ({
                    ...prev,
                    showFilters: !prev.showFilters,
                  }))
                }
                className={`px-4 py-2 rounded-lg shadow flex items-center ${
                  adoptedFilters.showFilters
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={adoptedFilters.showFilters ? faTimes : faFilter}
                  className="mr-2"
                />
                {adoptedFilters.showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button
                onClick={() => resetFilters(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>

            {/* Column Filters */}
            {adoptedFilters.showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={adoptedFilters.name}
                    onChange={(e) =>
                      setAdoptedFilters((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                {/* Pet Type Filter for Adopted Pets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Type
                  </label>
                  <select
                    value={adoptedFilters.petType}
                    onChange={(e) =>
                      setAdoptedFilters((prev) => ({
                        ...prev,
                        petType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>

                {/* Breed Filter for Adopted Pets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <select
                    value={adoptedFilters.breed}
                    onChange={(e) =>
                      setAdoptedFilters((prev) => ({
                        ...prev,
                        breed: e.target.value,
                      }))
                    }
                    disabled={!adoptedFilters.petType}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm disabled:opacity-50"
                  >
                    <option value="">All Breeds</option>
                    {availableAdoptedBreeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    value={adoptedFilters.size}
                    onChange={(e) =>
                      setAdoptedFilters((prev) => ({
                        ...prev,
                        size: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">All Sizes</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
            <table className="table-auto w-full text-sm text-gray-800">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Breed</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Size</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adoptedCurrentRows.length > 0 ? (
                  adoptedCurrentRows.map((record) => (
                    <tr
                      key={record.id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                    >
                      <td className="px-6 py-3 text-left">{record.name}</td>
                      <td className="px-6 py-3 text-left">{record.breed}</td>
                      <td className="px-6 py-3 text-left">{record.petType}</td>
                      <td className="px-6 py-3 text-left">{record.age}</td>
                      <td className="px-6 py-3 text-left">{record.size}</td>
                      <td className="px-6 py-3 text-left">
                        <button
                          onClick={() =>
                            navigate(`/view-profile/adopted/${record.id}`)
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-4 text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex space-x-2">
            {Array.from(
              { length: adoptedTotalPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setAdoptedPage(pageNumber)}
                className={`px-4 py-2 border rounded-lg ${
                  adoptedPage === pageNumber
                    ? "bg-bl ue-500 text-white"
                    : "bg-white text-gray-700"
                } hover:bg-blue-100`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetsAdoption;
