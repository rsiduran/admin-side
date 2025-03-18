import React, { useState } from 'react';
import AppSideBar from '../components/AppSideBar';

const Users = () => {
  const [users] = useState([
    { id: 1, username: 'AliceJohnson', email: 'alice@example.com', createdAt: '2023-04-01' },
    { id: 2, username: 'BobSmith', email: 'bob@example.com', createdAt: '2023-03-15' },
    { id: 3, username: 'CharlieBrown', email: 'charlie@example.com', createdAt: '2023-03-20' },
    { id: 4, username: 'DianaPrince', email: 'diana@example.com', createdAt: '2023-03-10' },
    { id: 5, username: 'EthanHunt', email: 'ethan@example.com', createdAt: '2023-02-25' },
    { id: 6, username: 'FionaShaw', email: 'fiona@example.com', createdAt: '2023-02-14' },
    { id: 7, username: 'GeorgeClooney', email: 'george@example.com', createdAt: '2023-01-30' },
    { id: 8, username: 'HannahMontana', email: 'hannah@example.com', createdAt: '2023-01-15' },
    { id: 9, username: 'IvanDrago', email: 'ivan@example.com', createdAt: '2023-01-05' },
    { id: 10, username: 'JackRyan', email: 'jack@example.com', createdAt: '2022-12-20' },
    { id: 11, username: 'KatieHolmes', email: 'katie@example.com', createdAt: '2022-12-15' },
    { id: 12, username: 'LiamNeeson', email: 'liam@example.com', createdAt: '2022-12-01' },
    { id: 13, username: 'MilaKunis', email: 'mila@example.com', createdAt: '2022-11-20' },
    { id: 14, username: 'NathanDrake', email: 'nathan@example.com', createdAt: '2022-11-05' },
    { id: 15, username: 'OliviaSpencer', email: 'olivia@example.com', createdAt: '2022-10-25' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    Object.keys(user).some((key) =>
      user[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
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
                <th className="px-6 py-3 text-left">Username</th>
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
                    <td className="px-6 py-3 text-left">{user.username}</td>
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
                  <td
                    colSpan={4}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No users found.
                  </td>
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
              onClick={() => handlePageChange(pageNumber)}
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
