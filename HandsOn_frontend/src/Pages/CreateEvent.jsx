import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const CreateEvent = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    details: "",
    date: "",
    location: "",
    start_time: "",
    end_time: "",
    category: "",
    member_limit: "",
  });

  const categories = [
    "Education",
    "Environment",
    "Healthcare",
    "Animal Welfare",
    "Community Development",
    "Elderly Care",
    "Youth Empowerment",
    "Disaster Relief",
    "Arts & Culture",
    "Food Security",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      navigate("/login");
      return;
    }

    // Decode the token to get user_id
    const decoded = jwtDecode(token);
    const userId = decoded.user;

    console.log("Decoded user ID:", userId);
    console.log("Sending data to backend:", eventData);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/create-event/${userId}`, 
        eventData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === "success") {
        alert("Event created successfully");
        navigate("/events-feed");
      } else {
        alert(response.data.message || "Event creation failed");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        alert(err.response.data.message || "Failed to create event");
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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

        <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create Volunteer Event
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Event Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="details"
                    value={eventData.details}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={eventData.date}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={eventData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={eventData.start_time}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={eventData.end_time}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location and Requirements */}
              <div className="space-y-4 pt-6">
                <h2 className="text-xl font-semibold text-gray-700">
                  Location and Requirements
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={eventData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Volunteers
                  </label>
                  <input
                    type="number"
                    name="member_limit"
                    value={eventData.member_limit}
                    onChange={handleChange}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
