import React, { useState, useEffect } from "react";
import AppSideBar from "../components/AppSideBar";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const navigate = useNavigate();

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    createdAt: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleViewProfile = (email) => {
    navigate(`/profile/${encodeURIComponent(email)}`);
  };

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000).toLocaleString()
            : "N/A",
        }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and column filters
  const filteredUsers = users.filter((user) => {
    // Global search filter
    const matchesSearch =
      searchTerm === "" ||
      Object.keys(user).some((key) => {
        const value = user[key];
        return (
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

    // Column-specific filters
    const matchesFirstName =
      columnFilters.firstName === "" ||
      (user.firstName &&
        user.firstName
          .toLowerCase()
          .includes(columnFilters.firstName.toLowerCase()));

    const matchesLastName =
      columnFilters.lastName === "" ||
      (user.lastName &&
        user.lastName
          .toLowerCase()
          .includes(columnFilters.lastName.toLowerCase()));

    const matchesEmail =
      columnFilters.email === "" ||
      (user.email &&
        user.email.toLowerCase().includes(columnFilters.email.toLowerCase()));

    const matchesCreatedAt =
      columnFilters.createdAt === "" ||
      (user.createdAt &&
        user.createdAt
          .toLowerCase()
          .includes(columnFilters.createdAt.toLowerCase()));

    return (
      matchesSearch &&
      matchesFirstName &&
      matchesLastName &&
      matchesEmail &&
      matchesCreatedAt
    );
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleColumnFilterChange = (columnName, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setColumnFilters({
      firstName: "",
      lastName: "",
      email: "",
      createdAt: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Users List</h1>

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
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon
                icon={showFilters ? faTimes : faFilter}
                className="mr-2"
              />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300"
            >
              Reset All Filters
            </button>
          </div>

          {/* Column Filters - Shown when showFilters is true */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Filter first name..."
                  value={columnFilters.firstName}
                  onChange={(e) =>
                    handleColumnFilterChange("firstName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Filter last name..."
                  value={columnFilters.lastName}
                  onChange={(e) =>
                    handleColumnFilterChange("lastName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Filter email..."
                  value={columnFilters.email}
                  onChange={(e) =>
                    handleColumnFilterChange("email", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <input
                  type="text"
                  placeholder="Filter creation date..."
                  value={columnFilters.createdAt}
                  onChange={(e) =>
                    handleColumnFilterChange("createdAt", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto shadow-xl border border-gray-300 rounded-lg">
          <table className="table-auto w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Fullname</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Created At</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((user) => (
                  <tr
                    key={user.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                  >
                    <td className="px-6 py-3 text-left">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-3 text-left">{user.email}</td>
                    <td className="px-6 py-3 text-left">{user.createdAt}</td>
                    <td className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleViewProfile(user.email)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex space-x-2 items-center justify-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  } hover:bg-blue-100`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
