import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit } from "@fortawesome/free-solid-svg-icons";

const PetsAdoption = () => {
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    breed: "",
    petPicture: null,
    additionalPhotos: [],
    description: "",
    gender: "Male", // Default value
    medicalRecords: null,
    spayCertificate: null,
    vaccinationRecords: null,
    size: "Small", // Default value
    petType: "Dog", // Default value
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files.length > 1 ? [...files] : files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload files to Firebase Storage (if any)
      const uploadFile = async (file, folder) => {
        const fileRef = ref(storage, `${folder}/${file.name}`);
        await uploadBytes(fileRef, file);
        return fileRef.fullPath;
      };

      const petPicturePath = formData.petPicture
        ? await uploadFile(formData.petPicture, "petPicture")
        : null;

      const additionalPhotosPaths = formData.additionalPhotos.length
        ? await Promise.all(
            formData.additionalPhotos.map((file) =>
              uploadFile(file, "additionalPhotos")
            )
          )
        : [];

      const medicalRecordsPath = formData.medicalRecords
        ? await uploadFile(formData.medicalRecords, "medical")
        : null;

      const spayCertificatePath = formData.spayCertificate
        ? await uploadFile(formData.spayCertificate, "spay")
        : null;

      const vaccinationRecordsPath = formData.vaccinationRecords
        ? await uploadFile(formData.vaccinationRecords, "vaccination")
        : null;

      // Save data to Firestore
      const docRef = await addDoc(collection(db, "adoption"), {
        name: formData.name,
        age: formData.age,
        breed: formData.breed,
        petPicture: petPicturePath,
        additionalPhotos: additionalPhotosPaths,
        description: formData.description,
        gender: formData.gender,
        medicalRecords: medicalRecordsPath,
        spayCertificate: spayCertificatePath,
        vaccinationRecords: vaccinationRecordsPath,
        size: formData.size,
        petType: formData.petType,
        createdAt: new Date(),
      });

      toast.success("Pet added successfully!");
      setShowModal(false);
      setFormData({
        name: "",
        age: "",
        breed: "",
        petPicture: null,
        additionalPhotos: [],
        description: "",
        gender: "Male",
        medicalRecords: null,
        spayCertificate: null,
        vaccinationRecords: null,
        size: "Small",
        petType: "Dog",
      }); // Reset form
    } catch (error) {
      console.error("Error adding pet:", error);
      toast.error("Error adding pet. Please try again.");
    }
  };

  const [adoptionRecords, setAdoptionRecords] = useState([]);
  const [adoptedRecords, setAdoptedRecords] = useState([]);
  const [adoptionSearch, setAdoptionSearch] = useState("");
  const [adoptedSearch, setAdoptedSearch] = useState("");
  const [adoptionPage, setAdoptionPage] = useState(1);
  const [adoptedPage, setAdoptedPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchAdoptionRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "adoption"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data()?.timestamp
            ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
            : "N/A",
        }));
        setAdoptionRecords(data);
      } catch (error) {
        console.error("Error fetching adoption records:", error);
      }
    };

    const fetchAdoptedRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "adopted"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data()?.timestamp
            ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
            : "N/A",
        }));
        setAdoptedRecords(data);
      } catch (error) {
        console.error("Error fetching adopted records:", error);
      }
    };

    fetchAdoptionRecords();
    fetchAdoptedRecords();
  }, []);

  // Filtering and Pagination for Adoption Table
  const filteredAdoption = adoptionRecords.filter((record) =>
    Object.keys(record).some((key) =>
      record[key]
        ?.toString()
        .toLowerCase()
        .includes(adoptionSearch.toLowerCase())
    )
  );
  const adoptionIndexOfLastRow = adoptionPage * rowsPerPage;
  const adoptionIndexOfFirstRow = adoptionIndexOfLastRow - rowsPerPage;
  const adoptionCurrentRows = filteredAdoption.slice(
    adoptionIndexOfFirstRow,
    adoptionIndexOfLastRow
  );

  const adoptionTotalPages = Math.ceil(filteredAdoption.length / rowsPerPage);

  // Filtering and Pagination for Adopted Table
  const filteredAdopted = adoptedRecords.filter((record) =>
    Object.keys(record).some((key) =>
      record[key]
        ?.toString()
        .toLowerCase()
        .includes(adoptedSearch.toLowerCase())
    )
  );
  const adoptedIndexOfLastRow = adoptedPage * rowsPerPage;
  const adoptedIndexOfFirstRow = adoptedIndexOfLastRow - rowsPerPage;
  const adoptedCurrentRows = filteredAdopted.slice(
    adoptedIndexOfFirstRow,
    adoptedIndexOfLastRow
  );

  const adoptedTotalPages = Math.ceil(filteredAdopted.length / rowsPerPage);

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
                        Age (in years)
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        placeholder="Enter pet's age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Breed and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="breed"
                        className="block text-gray-700 font-medium mb-1"
                      >
                        Breed
                      </label>
                      <input
                        type="text"
                        id="breed"
                        name="breed"
                        placeholder="Enter pet's breed"
                        value={formData.breed}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                      />
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
                      <label
                        htmlFor="petType"
                        className="block text-gray-700 font-medium mb-1"
                      >
                        Pet Type
                      </label>
                      <select
                        id="petType"
                        name="petType"
                        value={formData.petType}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                      >
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
                          htmlFor="medicalRecords"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Medical Records
                        </label>
                        <input
                          type="file"
                          id="medicalRecords"
                          name="medicalRecords"
                          onChange={handleFileChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="spayCertificate"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Spay Certificate
                        </label>
                        <input
                          type="file"
                          id="spayCertificate"
                          name="spayCertificate"
                          onChange={handleFileChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="vaccinationRecords"
                          className="block text-gray-700 font-medium mb-1"
                        >
                          Vaccination Records
                        </label>
                        <input
                          type="file"
                          id="vaccinationRecords"
                          name="vaccinationRecords"
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
                      Add Data
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Search adoption records..."
            value={adoptionSearch}
            onChange={(e) => setAdoptionSearch(e.target.value)}
            className="mb-4 w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
          />
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
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                            View
                          </button>
                          <button
                            // onClick={editData}
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
          <input
            type="text"
            placeholder="Search adopted records..."
            value={adoptedSearch}
            onChange={(e) => setAdoptedSearch(e.target.value)}
            className="mb-4 w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
          />
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
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
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
