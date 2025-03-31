import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";



const History = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const rowsPerPage = 8;
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Breed options by pet type
  const breedsByType = {
    Dog: ["Unknown", "Aspin", "Beagle", "Bulldog", "Chihuahua", "Dachshund", "German Shepherd",
      "Golden Retriever", "Labrador Retriever", "Maltese", "Pomeranian",
      "Poodle", "Pug", "Rottweiler", "Shih Tzu", "Siberian Husky", "Welsh Corgi", "Others"],
    Cat: ["Unknown", "Abyssinian", "Bengal", "Burmese", "Persian", "Puspin",
      "Ragdoll", "Russian Blue", "Scottish Fold", "Siamese", "Sphynx", "Others"],
  };

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    breed: '',
    petType: '',
    postType: '',
    timestamp: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState([]);

  // Update available breeds when pet type changes
  useEffect(() => {
    if (columnFilters.petType && breedsByType[columnFilters.petType]) {
      setAvailableBreeds(breedsByType[columnFilters.petType]);
      // Reset breed filter if it's not compatible with the new pet type
      if (!breedsByType[columnFilters.petType].includes(columnFilters.breed)) {
        setColumnFilters(prev => ({ ...prev, breed: '' }));
      }
    } else {
      setAvailableBreeds([]);
      setColumnFilters(prev => ({ ...prev, breed: '' }));
    }
  }, [columnFilters.petType]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const collections = ["missingHistory", "wanderingHistory", "foundHistory"];
        const allData = [];

        await Promise.all(
          collections.map(async (col) => {
            const q = query(collection(db, col), orderBy("removedAt", "desc"));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              allData.push({
                id: doc.id,
                collectionName: col,
                name: doc.data()?.name || "N/A",
                breed: doc.data()?.breed || "Unknown",
                petType: doc.data()?.petType || "Unknown",
                postType: doc.data()?.postType || "N/A",
                timestamp: doc.data()?.removedAt
                  ? new Date(doc.data().removedAt.seconds * 1000).toLocaleString()
                  : "N/A",
              });
            });
          })
        );

        // Sort all records by timestamp
        allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecords(allData);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  // Filter records based on search term and column filters
  const filteredRecords = records.filter((record) => {
    // Global search filter
    const matchesSearch = searchTerm === '' || 
      Object.keys(record).some((key) => {
        const value = record[key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    
    // Column-specific filters
    const matchesName = columnFilters.name === '' || 
      (record.name && record.name.toLowerCase().includes(columnFilters.name.toLowerCase()));
    
    const matchesBreed = columnFilters.breed === '' || 
      (record.breed && record.breed.toLowerCase() === columnFilters.breed.toLowerCase());
    
    const matchesPetType = columnFilters.petType === '' || 
      (record.petType && record.petType.toLowerCase() === columnFilters.petType.toLowerCase());
    
    const matchesPostType = columnFilters.postType === '' || 
      (record.postType && record.postType.toLowerCase().includes(columnFilters.postType.toLowerCase()));
    
    const matchesTimestamp = columnFilters.timestamp === '' || 
      (record.timestamp && record.timestamp.toLowerCase().includes(columnFilters.timestamp.toLowerCase()));
    
    return matchesSearch && matchesName && matchesBreed && matchesPetType && matchesPostType && matchesTimestamp;
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  
  const handleDelete = async (record) => {
    try {
      await deleteDoc(doc(db, record.collectionName, record.id));
      setRecords((prevRecords) =>
        prevRecords.filter((r) => r.id !== record.id)
      );
      setShowModal(false);
      toast.success("Record permanently deleted!");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Error deleting the record.");
    }
  };

  
  const handleCancelDelete = () => {
    setShowModal(false);
    toast.info("Deletion cancelled.");
  };

  const handleColumnFilterChange = (columnName, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setColumnFilters({
      name: '',
      breed: '',
      petType: '',
      postType: '',
      timestamp: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Pets History / Deleted</h1>

        {/* Search and Filter Controls */}
        <div className="mb-4 flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Global search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg shadow flex items-center ${
                showFilters 
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={showFilters ? faTimes : faFilter} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300"
            >
              Reset All Filters
            </button>
          </div>
          
          {/* Column Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={columnFilters.name}
                  onChange={(e) => handleColumnFilterChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                <select
                  value={columnFilters.petType}
                  onChange={(e) => handleColumnFilterChange('petType', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">All Types</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <select
                  value={columnFilters.breed}
                  onChange={(e) => handleColumnFilterChange('breed', e.target.value)}
                  disabled={!columnFilters.petType}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm disabled:opacity-50"
                >
                  <option value="">All Breeds</option>
                  {availableBreeds.map((breed) => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  placeholder="Filter by status..."
                  value={columnFilters.postType}
                  onChange={(e) => handleColumnFilterChange('postType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Removed</label>
                <input
                  type="text"
                  placeholder="Filter by date..."
                  value={columnFilters.timestamp}
                  onChange={(e) => handleColumnFilterChange('timestamp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
          <table className="table-auto w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Breed</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date Removed</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((record) => (
                  <tr
                    key={`${record.collectionName}-${record.id}`}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                  >
                    <td className="px-6 py-3 text-left">{record.name}</td>
                    <td className="px-6 py-3 text-left">{record.breed}</td>
                    <td className="px-6 py-3 text-left capitalize">{record.petType}</td>
                    <td className="px-6 py-3 text-left capitalize">{record.postType}</td>
                    <td className="px-6 py-3 text-left">{record.timestamp}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/view-profile/${record.collectionName}/${record.id}`)
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === pageNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700'
                  } hover:bg-blue-100`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Permanent Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to permanently delete the record for{" "}
              <strong>{selectedRecord.name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedRecord)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

     
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default History;
