import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { FaArrowLeft, FaUsers, FaLock, FaGlobe } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const CreateTeams = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
    created_by: "",
  });

  const categories = [
    "Environmental",
    "Social Justice",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Community Service",
    "Arts & Culture",
    "Disaster Relief",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.user;
    formData.created_by = userId;

    try {
      await axios.post(
        `http://localhost:5000/api/create-team/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Team created successfully");
      navigate("/teams");
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <SideBar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setAuth={setAuth}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <NavBar />
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6 flex items-center">
              <button
                onClick={() => navigate("/teams")}
                className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Create Team</h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-6 space-y-6"
            >
              {/* Team Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Team Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter team name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your team's mission and goals..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                ></textarea>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy Setting */}
              <div className="space-y-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Privacy Setting
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="isPrivate"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Make this team private
                    </label>
                  </div>
                  {formData.isPrivate ? (
                    <FaLock className="text-gray-500" />
                  ) : (
                    <FaGlobe className="text-gray-500" />
                  )}
                </div>

                <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600">
                  <div className="flex items-center mb-2">
                    {formData.isPrivate ? (
                      <FaLock className="mr-2" />
                    ) : (
                      <FaGlobe className="mr-2" />
                    )}
                    <span className="font-medium">
                      {formData.isPrivate ? "Private Team" : "Public Team"}
                    </span>
                  </div>
                  <p>
                    {formData.isPrivate
                      ? "Only invited members can join and see team activities."
                      : "Anyone can find and join this team."}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`flex items-center px-6 py-3 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 transform hover:-translate-y-0.5 transition-all duration-150 `}
                >
                  { (
                    <>
                      <FaUsers className="mr-2" />
                      Create Team
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeams;
