import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { FaUsers, FaLock, FaGlobe, FaCrown, FaUserShield, FaUser } from "react-icons/fa";

const TeamDash = ({ setAuth }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
    } else {
      setError("Team ID is missing");
      setLoading(false);
    }
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Fetching team details for ID:", teamId);
      const response = await axios.get(`http://localhost:5000/api/team/${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Team details response:", response.data);
      if (response.data.data) {
        setTeam(response.data.data);
      } else {
        setError("No team data found");
      }
    } catch (err) {
      console.error("Error fetching team details:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch team details");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaCrown className="text-yellow-500" />;
      case "moderator":
        return <FaUserShield className="text-blue-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
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
          <div className="container mx-auto px-4 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : team ? (
              <div className="space-y-6">
                {/* Team Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {team.name}
                    </h1>
                    {team.is_private ? (
                      <FaLock className="text-gray-500 text-xl" />
                    ) : (
                      <FaGlobe className="text-gray-500 text-xl" />
                    )}
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                    {team.category}
                  </span>
                  <p className="text-gray-600 mt-2">{team.description}</p>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <FaUsers className="text-purple-500 text-2xl mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                        <p className="text-3xl font-bold text-purple-600">{team.member_count}</p>
                      </div>
                    </div>
                  </div>
                  {/* Add more stats cards here */}
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                  </div>
                  <div className="divide-y">
                    {team.members.map((member) => (
                      <div key={member.user_id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                          ${member.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                          member.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Team not found
                </h3>
                <p className="text-gray-500">
                  The team you're looking for doesn't exist or you don't have access to it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDash;
