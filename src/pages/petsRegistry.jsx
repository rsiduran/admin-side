import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";

const PetsRegistry = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null); // For modal
  const rowsPerPage = 8;
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  useEffect(() => {
    // Function to fetch data from multiple collections
    const fetchRecords = async () => {
      try {
        const collections = ["missing", "wandering", "found"];
        const allData = [];

        await Promise.all(
          collections.map(async (col) => {
            const querySnapshot = await getDocs(collection(db, col));
            querySnapshot.forEach((doc) => {
              allData.push({
                id: doc.id,
                collectionName: col, // To identify the collection the record came from
                name: doc.data()?.name || "N/A",
                breed: doc.data()?.breed || "N/A",
                petType: doc.data()?.petType || "N/A",
                postType: doc.data()?.postType || "N/A",
                timestamp: doc.data()?.timestamp
                  ? new Date(
                      doc.data().timestamp.seconds * 1000
                    ).toLocaleString()
                  : "N/A",
              });
            });
          })
        );

        setRecords(allData);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  // Filter records based on the search term
  const filteredRecords = records.filter((record) =>
    Object.keys(record).some((key) => {
      const value = record[key];
      return (
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Delete a record
  const handleDelete = async (record) => {
    try {
      await deleteDoc(doc(db, record.collectionName, record.id));
      setRecords((prevRecords) =>
        prevRecords.filter((r) => r.id !== record.id)
      );
      setShowModal(false); // Close modal after deletion
      toast.success("Delete Completed!"); // Show success toast
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Error deleting the record."); // Show error toast
    }
  };

  // Cancel delete action
  const handleCancelDelete = () => {
    setShowModal(false); // Close modal
    toast.info("Delete Cancelled."); // Show cancel toast
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Pets Registry</h1>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Combined Table */}
        <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
          <table className="table-auto w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Breed</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((record) => (
                  <tr
                    key={record.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                  >
                    <td className="px-6 py-3 text-left">{record.name}</td>
                    <td className="px-6 py-3 text-left">{record.breed}</td>
                    <td className="px-6 py-3 text-left">{record.petType}</td>
                    <td className="px-6 py-3 text-left">{record.postType}</td>
                    <td className="px-6 py-3 text-left">{record.timestamp}</td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
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
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } hover:bg-blue-100`}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && selectedRecord && (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.5)", // Transparent black overlay
            boxShadow: "0 4px 10px rgba(0, 0, 0, 1)", // Strong black shadow
          }}
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedRecord.name}</strong> from the registry?
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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PetsRegistry;
