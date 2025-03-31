import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, orderBy, query, getDoc, where, addDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AdoptionRequest = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const rowsPerPage = 8;
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({
    transactionNumber: '',
    fullName: '',
    contactEmail: '',
    petName: '',
    applicationStatus: '',
    timestamp: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Status options for dropdown
  const statusOptions = ["All Statuses", "Pending", "Approved", "Rejected", "Completed"];

  useEffect(() => {
  
    const fetchRecords = async () => {
      try {
        const adoptionAppQuery = query(
          collection(db, "adoptionApplication"),
          orderBy("timestamp", "desc")
        );
  
        const querySnapshot = await getDocs(adoptionAppQuery);
        const allData = [];
  
        querySnapshot.forEach((doc) => {
          allData.push({
            id: doc.id,
            collectionName: "adoptionApplication",
            transactionNumber: doc.data()?.transactionNumber || "N/A",
            contactFirstName: doc.data()?.contactFirstName || "N/A",
            contactEmail: doc.data()?.contactEmail || "N/A",
            firstName: doc.data()?.firstName || "N/A",
            lastName: doc.data()?.lastName || "N/A",
            name: doc.data()?.name || "N/A",
            applicationStatus: doc.data()?.applicationStatus || "Pending",
            timestamp: doc.data()?.timestamp
              ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
              : "N/A",
          });
        });
  
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
    const matchesTransactionNumber = columnFilters.transactionNumber === '' || 
      (record.transactionNumber && record.transactionNumber.toLowerCase().includes(columnFilters.transactionNumber.toLowerCase()));
    
    const matchesFullName = columnFilters.fullName === '' || 
      ((record.firstName + ' ' + record.lastName).toLowerCase().includes(columnFilters.fullName.toLowerCase()));
    
    const matchesEmail = columnFilters.contactEmail === '' || 
      (record.contactEmail && record.contactEmail.toLowerCase().includes(columnFilters.contactEmail.toLowerCase()));
    
    const matchesPetName = columnFilters.petName === '' || 
      (record.name && record.name.toLowerCase().includes(columnFilters.petName.toLowerCase()));
    
    const matchesStatus = columnFilters.applicationStatus === '' || 
      columnFilters.applicationStatus === "All Statuses" ||
      (record.applicationStatus && record.applicationStatus.toLowerCase() === columnFilters.applicationStatus.toLowerCase());
    
    const matchesTimestamp = columnFilters.timestamp === '' || 
      (record.timestamp && record.timestamp.toLowerCase().includes(columnFilters.timestamp.toLowerCase()));
    
    return matchesSearch && matchesTransactionNumber && matchesFullName && 
           matchesEmail && matchesPetName && matchesStatus && matchesTimestamp;
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  
  const handleDelete = async (record) => {
    try {
      const docRef = doc(db, record.collectionName, record.id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        throw new Error("Application not found");
      }
  
      // Check if already exists in history
      const historyQuery = query(
        collection(db, "adoptionApplicationHistory"),
        where("originalId", "==", record.id),
        where("originalCollection", "==", record.collectionName)
      );
      const historySnapshot = await getDocs(historyQuery);
  
      if (!historySnapshot.empty) {
        throw new Error("This application already exists in history");
      }
  
      // Format timestamp (March 30, 2025 at 5:03:43 PM UTC+8)
      const now = new Date();
      const options = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZoneName: 'short', 
        timeZone: 'Asia/Manila'
      };
      const formattedDate = now.toLocaleString('en-US', options);
  
      // Prepare history record
      const historyRecord = {
        ...docSnapshot.data(),
        originalCollection: record.collectionName,
        originalId: record.id,
        deletedAt: formattedDate,
        viewed: "NO",
        timestamp: now.getTime(),
      };
  
      // Add to adoption application history
      await addDoc(collection(db, "adoptionApplicationHistory"), historyRecord);
      
      // Delete original application
      await deleteDoc(docRef);
      
      // Update local state
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setShowModal(false);
      toast.success("Application archived and deleted successfully!");
  
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error(`Deletion failed: ${error.message}`);
      setShowModal(false);
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
      transactionNumber: '',
      fullName: '',
      contactEmail: '',
      petName: '',
      applicationStatus: '',
      timestamp: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Adoption Applications</h1>

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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction #</label>
                <input
                  type="text"
                  placeholder="Filter by transaction #..."
                  value={columnFilters.transactionNumber}
                  onChange={(e) => handleColumnFilterChange('transactionNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={columnFilters.fullName}
                  onChange={(e) => handleColumnFilterChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  placeholder="Filter by email..."
                  value={columnFilters.contactEmail}
                  onChange={(e) => handleColumnFilterChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                <input
                  type="text"
                  placeholder="Filter by pet name..."
                  value={columnFilters.petName}
                  onChange={(e) => handleColumnFilterChange('petName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={columnFilters.applicationStatus}
                  onChange={(e) => handleColumnFilterChange('applicationStatus', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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

        {/* Applications Table */}
        <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
          <table className="table-auto w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Transaction #</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Pet Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Timestamp</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((record) => (
                  <tr
                    key={record.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                  >
                    <td className="px-6 py-3 text-left">{record.transactionNumber}</td>
                    <td className="px-6 py-3 text-left">{record.firstName} {record.lastName}</td>
                    <td className="px-6 py-3 text-left">{record.contactEmail}</td>
                    <td className="px-6 py-3 text-left">{record.name}</td>
                    <td className="px-6 py-3 text-left capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.applicationStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        record.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        record.applicationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-left">{record.timestamp}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          const docRef = doc(db, record.collectionName, record.id); // Reference to Firestore doc

                          try {
                            await updateDoc(docRef, { viewed: "YES" }); // Update Firestore

                            // Update local state to reflect change immediately (optional)
                            setRecords(prevRecords =>
                              prevRecords.map(r =>
                                r.id === record.id ? { ...r, viewed: "YES" } : r
                              )
                            );

                            // Navigate after update
                            navigate(`/view-profile/${record.collectionName}/${record.id}`);
                          } catch (error) {
                            console.error("Error updating viewed status:", error);
                          }
                        }}
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
                    colSpan={7}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No applications match your filters.
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
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the adoption application for{" "}
              <strong>{selectedRecord.name}</strong>?
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdoptionRequest;
