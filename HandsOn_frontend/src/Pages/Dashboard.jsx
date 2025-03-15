import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import axios from "axios";
import {
  FaCalendarAlt,
  FaUsers,
  FaMedal,
  FaCheckCircle,
  FaStar,
  FaClock,
  FaMapMarkerAlt
} from "react-icons/fa";
import { Link, useParams, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';

const Dashboard = ({ setAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    gender: '',
    dob: '',
    skills: [],
    causes: [],
    about: '',
  });
  
  const [joinedEvents, setJoinedEvents] = useState([]);


  const [stats] = useState({
    upcomingEvents: 3,
    hoursVolunteered: 24,
    communitiesHelped: 5,
    achievements: 7,
    completedEvents: 12,
    impactScore: 850
  });

  const [recommendedEvents] = useState([
    {
      id: 1,
      title: "Literacy Tutoring Program",
      description: "Help adults improve their reading and writing skills in a supportive environment",
      date: "2024-03-15",
      time: "14:00-16:00",
      location: "City Library, Room 204",
      category: "Education",
      image: "gradient-to-r from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Beach Cleanup Drive",
      description: "Join us in cleaning up the coastline and protecting marine life",
      date: "2024-03-20",
      time: "09:00-12:00",
      location: "Sunset Beach, North End",
      category: "Environmental",
      image: "gradient-to-r from-green-500 to-green-600"
    },
    {
      id: 3,
      title: "Senior Care Support",
      description: "Provide companionship and assistance to elderly residents",
      date: "2024-03-18",
      time: "10:00-13:00",
      location: "Golden Age Care Home",
      category: "Healthcare",
      image: "gradient-to-r from-purple-500 to-purple-600"
    },
    {
      id: 4,
      title: "Food Bank Distribution",
      description: "Help sort and distribute food to families in need",
      date: "2024-03-22",
      time: "08:00-11:00",
      location: "Community Center",
      category: "Food Security",
      image: "gradient-to-r from-orange-500 to-orange-600"
    }
  ]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id) {
          console.error('No user ID provided');
          navigate('/login');
          return;
        }
        console.log("user ID:", id);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("API Response:", response.data);

        if (response.data && response.data.data) {
          const extractedData = response.data.data;
          //console.log("Extracted data:", extractedData);
        
          const user = extractedData.user || {};
          
          const skills = user && user.skills 
            ? (Array.isArray(user.skills) 
                ? user.skills 
                : (typeof user.skills === 'string' && user.skills
                    ? user.skills.split(',').map(skill => skill.trim()) 
                    : []))
            : [];
          
          const causes = user && user.causes 
            ? (Array.isArray(user.causes) 
                ? user.causes 
                : (typeof user.causes === 'string' && user.causes
                    ? user.causes.split(',').map(cause => cause.trim()) 
                    : []))
            : [];
          
          setUserData({
            id: user.user_id,
            name: user.name ,
            email: user.email ,
            gender: user.gender ,
            dob: user.dob ,
            skills: skills,
            causes: causes,
            about: user.about ,
          });
          
          // Set joined events
          if (extractedData.joinedEvents) {
            setJoinedEvents(extractedData.joinedEvents);
            //console.log("Joined events:", extractedData.joinedEvents);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          setAuth(false);
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [id, navigate, setAuth]);

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

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "No time specified";
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex">
        <SideBar 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setAuth={setAuth}
        />
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <NavBar />
          <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Welcome back, {userData.name}!
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Thank you for making a difference in your community.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Profile Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50 sticky top-8">
                  <div className="text-center mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-5xl text-white font-bold">
                        {userData.name.charAt(0)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {userData.name}
                    </h2>
                    <p className="text-blue-600">{userData.email}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gender</span>
                          <span className="text-gray-800 font-medium">{userData.gender}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Date of Birth</span>
                          <span className="text-gray-800 font-medium">{userData.dob}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {userData.skills && userData.skills.length > 0 ? (
                          userData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No skills added yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Causes</h3>
                      <div className="flex flex-wrap gap-2">
                        {userData.causes && userData.causes.length > 0 ? (
                          userData.causes.map((cause, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                            >
                              {cause}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No causes added yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {userData.about}
                      </p>
                    </div>

                    <Link
                      to={`/edit-profile/${id}`}
                      state={{ data: userData }}
                      className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                      <span className="mr-2">✏️</span>
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats and Events Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Stats Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Impact</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Upcoming</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
                      <p className="text-sm opacity-80">Events</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaClock className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Hours</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.hoursVolunteered}</p>
                      <p className="text-sm opacity-80">Volunteered</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaUsers className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Communities</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.communitiesHelped}</p>
                      <p className="text-sm opacity-80">Helped</p>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaMedal className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Achievements</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.achievements}</p>
                      <p className="text-sm opacity-80">Earned</p>
                    </div>

                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaCheckCircle className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Completed</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.completedEvents}</p>
                      <p className="text-sm opacity-80">Events</p>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-2">
                        <FaStar className="text-2xl mr-2" />
                        <h3 className="text-lg font-semibold">Impact</h3>
                      </div>
                      <p className="text-3xl font-bold">{stats.impactScore}</p>
                      <p className="text-sm opacity-80">Points</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Upcoming Events</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Event</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {joinedEvents.length > 0 ? (
                            joinedEvents.map((event) => (
                              <tr key={event.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-4 text-sm font-medium text-gray-800">{event.title}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{formatDate(event.date)}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{formatTime(event.start_time)} - {formatTime(event.end_time)}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{event.location}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{event.category}</td>
                                <td className="px-4 py-4 text-sm">
                                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                No upcoming events. Browse opportunities to get involved!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                </div>

                {/* Recommended Opportunities Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended For You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedEvents.map((event) => (
                      <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                        <div className={`h-24 bg-${event.image} flex items-center justify-center`}>
                          <span className="text-white text-lg font-semibold">{event.category}</span>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <FaCalendarAlt className="mr-2" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <FaClock className="mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <FaMapMarkerAlt className="mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;