import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserCircle,
  FaClipboardList,
  FaChartLine,
  FaBell,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed, setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      if (setAuth) {
        setAuth(false);
        navigate('/login');
      } else {
        console.error("setAuth is undefined");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const menuItems = [
    { 
      icon: <FaHome size={20} />, 
      text: 'Dashboard', 
      path: '/dashboard'
    },
    { 
      icon: <FaUserCircle size={20} />, 
      text: 'Profile', 
      path: '/edit-profile'
    },
    { 
      icon: <FaClipboardList size={20} />, 
      text: 'Events', 
      path: '/events-feed'
    },
    
    { 
      icon: <FaBell size={20} />, 
      text: 'Help Requests', 
      path: '/help-request'
    },
    { 
      icon: <FaCog size={20} />, 
      text: 'Teams', 
      path: '/teams'
    },
    { 
        icon: <FaChartLine size={20} />, 
        text: 'Impact', 
        path: '/impact'
    },
    
  ];

  return (
    <div className={`bg-white h-screen shadow-lg fixed left-0 transition-all duration-300 ${
      isSidebarCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-300"
      >
        <svg
          className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${
            isSidebarCollapsed ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Menu Items */}
      <div className="py-8 px-4">
        {/* Regular Menu Items */}
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center p-3 mb-2 rounded-lg transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              <span
                className={`ml-3 font-medium ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}
              >
                {item.text}
              </span>
            </div>
          </Link>
        ))}

        {/* Logout Button - Now part of the main menu list */}
        <div className="mt-2 border-t border-gray-100 pt-2">
          <button
            onClick={(e) => logout(e)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 text-red-600 hover:bg-red-50`}
          >
            <FaSignOutAlt size={20} />
            <span
              className={`ml-3 font-medium ${
                isSidebarCollapsed ? 'hidden' : 'block'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;