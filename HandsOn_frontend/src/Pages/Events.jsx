import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaPlus,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";

const Events = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterData, setFilterData] = useState({
    category: "All Categories",
    location: "All Locations",
    date: "",
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Categories for filter
  const categories = [
    "All Categories",
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

  const locations = [
    "All Locations",
    "Dhaka",
    "Khulna",
    "Rajshahi",
    "Sylhet",
    "Comilla",
    "Barisal",
    "Rangpur",
    "Mymensingh",
    "Chittagong",
  ];

  const navigateToCreateEvent = () => {
    navigate("/create-event");
  };

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      console.log("Fetching all events");
      
      const response = await axios.get(
        "http://localhost:5000/api/get-events"
      );
      console.log("API Response:", response.data);
      
      // Check if response.data.data exists and is an array
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        const allEvents = response.data.data;
        setEvents(allEvents);
        setFilteredEvents(allEvents);
      } else {
        console.error(
          "API response format is not as expected:",
          response.data
        );
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
      setFilteredEvents([]);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters to events
  const applyFilters = () => {
    console.log("Applying filters:", filterData);
    try {

      let filtered = [...events];
      let filterCount = 0;
      
      // Apply category filter
      if (filterData.category && filterData.category !== "All Categories") {
        filtered = filtered.filter(event => 
          event.category === filterData.category
        );
        console.log(`After category filter: ${filtered.length} events`);
        filterCount++;
      }
      
      // Apply location filter
      if (filterData.location && filterData.location !== "All Locations") {
        filtered = filtered.filter(event => 
          event.location && event.location.toLowerCase().includes(filterData.location.toLowerCase())
        );
        console.log(`After location filter: ${filtered.length} events`);
        filterCount++;
      }
      
      // Apply date filter
      if (filterData.date && filterData.date.trim() !== "") {
        const filterDate = new Date(filterData.date).toISOString().split('T')[0];
        filtered = filtered.filter(event => {
          if (!event.date) return false;
          const eventDate = new Date(event.date).toISOString().split('T')[0];
          return eventDate === filterDate;
        });
        console.log(`After date filter: ${filtered.length} events`);
        filterCount++;
      }
      
      setActiveFilterCount(filterCount);
      setFilteredEvents(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    //console.log("Filter form submitted with data:", filterData);
    const activeFilters = [];
    if (filterData.category !== "All Categories") activeFilters.push(`Category: ${filterData.category}`);
    if (filterData.location !== "All Locations") activeFilters.push(`Location: ${filterData.location}`);
    if (filterData.date) activeFilters.push(`Date: ${filterData.date}`);

    // if (activeFilters.length > 0) {
    //   console.log("Active filters:", activeFilters.join(", "));
    // } else {
    //   console.log("No active filters - showing all events");
    // }
    applyFilters();
  };

  const resetFilters = () => {
    setFilterData({
      category: "All Categories",
      location: "All Locations",
      date: "",
    });
    setFilteredEvents(events);
    setActiveFilterCount(0);
    //console.log("Filters reset - showing all events");
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

        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          {/* Header with Create Event Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Volunteer Events
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Find and join volunteer opportunities in your community
              </p>
            </div>

            {/* Create Event Button */}
            <button
              onClick={navigateToCreateEvent}
              className="mt-4 md:mt-0 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <FaPlus className="mr-2" />
              Create Event
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filter Events</h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
                </span>
              )}
            </div>
            <form onSubmit={handleFilter} className="space-y-4">  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select 
                    name="category"
                    value={filterData.category}
                    onChange={(e) => setFilterData({ ...filterData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select 
                    name="location"
                    value={filterData.location}
                    onChange={(e) =>
                      setFilterData({ ...filterData, location: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={filterData.date}
                    onChange={(e) =>
                      setFilterData({ ...filterData, date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300 shadow-md"
                >
                  Reset Filters
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  <FaFilter className="mr-2" />
                  Apply Filters
                </button>
              </div>
            </form>
          </div>

          {/* Events Display */}
          {filteredEvents.length === 0 ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">No events found</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No events found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={navigateToCreateEvent}
                className="mt-4 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 mx-auto"
              >
                <FaPlus className="mr-2" />
                Create a New Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.event_id || event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className={`h-3 ${
                      event.category === "Education"
                        ? "bg-blue-500"
                        : event.category === "Environment"
                        ? "bg-green-500"
                        : event.category === "Healthcare"
                        ? "bg-red-500"
                        : event.category === "Animal Welfare"
                        ? "bg-yellow-500"
                        : event.category === "Community Development"
                        ? "bg-purple-500"
                        : event.category === "Elderly Care"
                        ? "bg-pink-500"
                        : event.category === "Youth Empowerment"
                        ? "bg-indigo-500"
                        : event.category === "Disaster Relief"
                        ? "bg-orange-500"
                        : event.category === "Arts & Culture"
                        ? "bg-teal-500"
                        : "bg-gray-500"
                    }`}
                  ></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {event.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.details}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-gray-400" />
                        <span>
                          {event.start_time || event.startTime} -{" "}
                          {event.end_time || event.endTime}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-2 text-gray-400" />
                        <span>
                          {event.registeredVolunteers || 0}/
                          {event.member_limit ||
                            event.maxVolunteers ||
                            "unlimited"}{" "}
                          volunteers
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        //onClick={() => handleRegister(event.id)}
                        disabled={
                          event.registeredVolunteers >=
                          (event.member_limit || event.maxVolunteers)
                        }
                        className={`flex-1 py-2 px-4 rounded-md transition-colors duration-300 ${
                          event.registeredVolunteers >=
                          (event.member_limit || event.maxVolunteers)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {event.registeredVolunteers >=
                        (event.member_limit || event.maxVolunteers)
                          ? "Full"
                          : "Join"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
