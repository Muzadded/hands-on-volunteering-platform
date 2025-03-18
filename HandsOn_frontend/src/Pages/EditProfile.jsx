import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMars,
  FaBookOpen,
  FaHeart,
  FaSave,
  FaTimes
} from "react-icons/fa";



const EditProfile = ({ setAuth }) => {
  const location = useLocation();
  const prevData = location.state?.data;

  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    skills: "",
    causes: [],
    about: ""
  });

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const userData = {
          name: prevData.name,
          email: prevData.email,
          gender: prevData.gender,
          dob: prevData.dob,
          skills: Array.isArray(prevData.skills) ? prevData.skills.join(', ') : prevData.skills || '',
          causes: prevData.causes,
          about: prevData.about
        };
        setFormData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [prevData, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = prevData?.id;

    const updateSkills = formData.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .join(',');

    const updatedFormData = {
      ...formData,
      skills: updateSkills
    };

    axios.put(`http://localhost:5000/api/users/${id}`, updatedFormData)
    .then((res) => {
      console.log(res);
      alert("Profile updated successfully");
      navigate("/dashboard");
    })
    .catch((err) => {
      console.log(err);
    })
  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SideBar 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        setAuth={setAuth}
      />
        
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
            <NavBar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-300"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>


                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-gray-700 font-medium flex items-center">
                        <FaUser className="mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-700 font-medium flex items-center">
                        <FaEnvelope className="mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email} disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-700 font-medium flex items-center">
                        <FaMars className="mr-2" />
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-700 font-medium flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                      />
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <label className="text-gray-700 font-medium flex items-center">
                      <FaBookOpen className="mr-2" />
                      Skills (comma-separated)
                    </label>
                    <div className="flex gap-2">
                    <input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  type="text"
                  placeholder="e.g., Teaching, First Aid, Web Development, Cooking, Photography"
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
                    </div>
                  </div>

                  {/* Causes Section */}
                  <div className="space-y-4">
                    <label className="text-gray-700 font-medium flex items-center">
                      <FaHeart className="mr-2" />
                      Causes You Support
                    </label>
                    <div className="flex gap-2">
                    <select
                  id="causes"
                  name="causes"
                  value={formData.causes}
                  multiple
                  onChange={(e) => setFormData({ ...formData, causes: Array.from(e.target.selectedOptions, option => option.value) })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  size="4"
                >
                  <option value="environmental">Environmental</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="animal-welfare">Animal Welfare</option>
                  <option value="homelessness">Homelessness</option>
                  <option value="hunger">Hunger Relief</option>
                  <option value="elderly">Elderly Support</option>
                  <option value="children">Children & Youth</option>
                  <option value="disaster-relief">Disaster Relief</option>
                  <option value="community-development">Community Development</option>
                  <option value="arts-culture">Arts & Culture</option>
                  <option value="human-rights">Human Rights</option>
                  <option value="human-rights">Human Rights</option>
                  <option value="human-rights">Others</option>
                </select>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">About</label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                      placeholder="Tell us about yourself and your volunteering interests..."
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default EditProfile;
