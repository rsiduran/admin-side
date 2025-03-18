import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../auth/logout';
import AppSideBar from '../components/AppSideBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';


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
  const [adoptionStats, setAdoptionStats] = useState([]);
  const [rescueStats, setRescueStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

    const fetchRecentActivity = async () => {
      try {
        const collections = ["missing", "wandering", "found", "adoptionApplication", "rescue"];
        let activities = [];

        await Promise.all(
          collections.map(async (col) => {
            const q = query(collection(db, col), orderBy("timestamp", "desc"), limit(5));
            const snapshot = await getDocs(q);

            snapshot.docs.forEach((doc) => {
              activities.push({
                id: doc.id,
                ...doc.data(),
                collection: col,
                timestamp: doc.data().timestamp
                  ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
                  : "N/A",
              });
            });
          })
        );

        // Sort all recent activities by timestamp
        activities.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

        // Limit to the five most recent
        setRecentActivities(activities.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    const fetchGraphData = async () => {
      try {
        const adoptionQuery = await getDocs(collection(db, "adoptionApplication"));
        const rescueQuery = await getDocs(collection(db, "rescue"));
        
        const adoptionMap = {};
        adoptionQuery.forEach((doc) => {
          const status = doc.data().applicationStatus || "Unknown";
          adoptionMap[status] = (adoptionMap[status] || 0) + 1;
        });
        setAdoptionStats(Object.entries(adoptionMap).map(([name, value]) => ({ name, value })));
        
        const rescueMap = {};
        rescueQuery.forEach((doc) => {
          const status = doc.data().reportStatus || "Unknown";
          rescueMap[status] = (rescueMap[status] || 0) + 1;
        });
        setRescueStats(Object.entries(rescueMap).map(([name, value]) => ({ name, value })));
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchCounts();
    fetchRecentActivity();
    fetchGraphData();
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

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Adoption Applications Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adoptionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Rescue Reports Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rescueStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Content */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-100">
                        <td className="px-6 py-4 text-sm text-gray-900">{activity.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 capitalize">{activity.collection}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activity.postType || activity.reportStatus || activity.applicationStatus || "No name"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{activity.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No recent activity</td>
                    </tr>
                  )}
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