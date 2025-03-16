import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { FaArrowLeft } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const CreateHelpPost = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    details: "",
    location: "",
    urgency_level: "default",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const decoded = jwtDecode(token);
    const userId = decoded.user;
    //console.log("Decoded user ID:", userId);
    try {
      await axios.post(
        `http://localhost:5000/api/create-help-post/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Help post created successfully");

      navigate("/help-request");
    } catch (err) {
      alert("Failed to create help post. Please try again.");
      console.error("Error creating help post:", err);

    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
                onClick={() => navigate("/help-request")}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Help Request
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="mb-6">
                <label
                  htmlFor="details"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Details*
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  required
                  placeholder="Describe what help you need..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="location"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter the location"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="urgency_level"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Urgency Level*
                </label>
                <select
                  id="urgency_level"
                  name="urgency_level"
                  value={formData.urgency_level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="default">Default</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 transform hover:-translate-y-0.5 transition-all duration-150`}
                >
                  Create Help Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHelpPost;
