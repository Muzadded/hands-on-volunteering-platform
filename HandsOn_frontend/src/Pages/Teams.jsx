import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import { FaUsers, FaLock, FaGlobe, FaSearch, FaPlus } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const Teams = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/get-teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Teams response:", response.data);
      const teamsData = response.data.data || [];
      console.log("Processed teams data:", teamsData);
      setTeams(teamsData);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleJoinTeam = async (teamId) => {
    console.log("Team ID:", teamId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.user;

      await axios.post(
        `http://localhost:5000/api/join-team/${teamId}`,
        { teamId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Team joined successfully");
      // Refresh teams list
      fetchTeams();
    } catch (err) {
      console.error("Error joining team:", err);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <SideBar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setAuth={setAuth}
        />
        <div
          className={`flex-1 transition-all duration-300 flex flex-col ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <NavBar />
          <div className="container mx-auto px-4 py-8 flex-grow">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Volunteer Teams
              </h1>
              <button
                onClick={() => navigate("/create-team")}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Create Team
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            {teams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Team Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {team.name}
                        </h3>
                        {team.is_private ? (
                          <FaLock className="text-gray-500" />
                        ) : (
                          <FaGlobe className="text-gray-500" />
                        )}
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {team.category}
                      </span>
                    </div>

                    {/* Team Description */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {team.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaUsers className="mr-2" />
                          {team.member_count || 0} members
                        </div>
                        {team.is_member ? (
                          <button
                            onClick={() => navigate(`/team/${team.id}`)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center bg-purple-600 text-white hover:bg-purple-700"
                          >
                            Team Details
                          </button>
                        ) : (
                          <button
                            onClick={() => !team.is_private && handleJoinTeam(team.id)}
                            disabled={team.is_private}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                              team.is_private
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {team.is_private ? (
                              <>
                                <FaLock className="mr-2" />
                                Private
                              </>
                            ) : (
                              'Join Team'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No teams found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Teams;
