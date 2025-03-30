import React, { useState } from "react";
import AppSideBar from "../components/AppSideBar";
import { db2 } from "../firebase"; // Import Firestore database
import { collection, addDoc } from "firebase/firestore"; // Firestore functions for adding documents
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadArticlesVet = () => {
  const [selection, setSelection] = useState("article"); // Default selection is 'article'
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverImage: "",
    link: "",
    clinicName: "",
    address: "",
    picture: "",
    snsLink: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getFormattedTimestamp = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Singapore",
      timeZoneName: "short",
    }).format(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const collectionName = selection === "article" ? "article" : "vetClinic";

      const dataToSave =
        selection === "article"
          ? {
              title: formData.title,
              author: formData.author,
              coverImage: formData.coverImage,
              link: formData.link,
              createdAt: getFormattedTimestamp(), // Add createdAt timestamp
            }
          : {
              clinicName: formData.clinicName,
              address: formData.address,
              picture: formData.picture,
              snsLink: formData.snsLink,
              timestamp: getFormattedTimestamp(), // Add timestamp field
            };

      // Save data to Firestore
      await addDoc(collection(db2, collectionName), dataToSave);
      toast.success(`Data saved successfully to '${collectionName}' collection!`);

      // Reset form
      setFormData({
        title: "",
        author: "",
        coverImage: "",
        link: "",
        clinicName: "",
        address: "",
        picture: "",
        snsLink: "",
      });
      setSelection("article");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <AppSideBar />
      <div className="p-6 w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          Upload Articles / Vet Clinic
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Selection
            </label>
            <select
              name="selection"
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="article">Article</option>
              <option value="vetClinic">Vet Clinic</option>
            </select>
          </div>

          {selection === "article" && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          {selection === "vetClinic" && (
            <>
              {/* Clinic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Clinic Name
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Picture URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Picture URL
                </label>
                <input
                  type="url"
                  name="picture"
                  value={formData.picture}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* SNS Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SNS Link
                </label>
                <input
                  type="url"
                  name="snsLink"
                  value={formData.snsLink}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default UploadArticlesVet;