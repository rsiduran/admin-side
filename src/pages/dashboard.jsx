import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore"


const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    missing: 0,
    wandering: 0,
    found: 0,
    adoptionApplication: 0,
    rescue: 0,
    adopted: 0,
  });
  const [adoptionStats, setAdoptionStats] = useState({});
  const [rescueStats, setRescueStats] = useState({});

  useEffect(() => {
    toast.success("Welcome back, Admin!");
    
    const fetchCounts = async () => {
      try {
        const collections = [
          "missing",
          "wandering",
          "found",
          "adoptionApplication",
          "rescue",
          "adopted",
        ];
        const countsData = {};

        await Promise.all(
          collections.map(async (col) => {
            const snapshot = await getDocs(collection(db, col));
            countsData[col] = snapshot.size || 0;
          })
        );

        setCounts(countsData);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    const fetchStatusCounts = async (colName, fieldName, setState) => {
      try {
        const snapshot = await getDocs(collection(db, colName));
        const statusCounts = {};

        snapshot.docs.forEach((doc) => {
          const status = doc.data()[fieldName];
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        setState(statusCounts);
      } catch (error) {
        console.error(`Error fetching ${colName} stats:`, error);
      }
    };

    fetchCounts();
    fetchStatusCounts("adoptionApplication", "applicationStatus", setAdoptionStats);
    fetchStatusCounts("rescue", "reportStatus", setRescueStats);
  }, []);
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AppSideBar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <button
            onClick={() => handleLogout(navigate)}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Quick Stats */}
            {Object.entries(counts).map(([key, value]) => (
              <div key={key} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">{key.replace(/([A-Z])/g, " $1")}</h2>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
            ))}

          </div>

          {/* Additional Content */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">#1234</td>
                    <td className="px-6 py-4 text-sm text-gray-900">John Doe</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Shipped</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$120.00</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">#1235</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Jane Smith</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Processing</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$95.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;