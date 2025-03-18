import React, { useState, useEffect } from 'react';
import AppSideBar from '../components/AppSideBar';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore"

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map(doc => ({
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

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    Object.keys(user).some((key) => {
      const value = user[key];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Users List</h1>

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
                  <tr key={user.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
                    <td className="px-6 py-3 text-left">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-3 text-left">{user.email}</td>
                    <td className="px-6 py-3 text-left">{user.createdAt}</td>
                    <td className="px-6 py-3 text-left">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center px-6 py-4 text-gray-500">No users found.</td>
                </tr>
              )}  
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Users;
