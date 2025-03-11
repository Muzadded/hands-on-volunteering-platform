import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import { useState } from "react";
import axios from "axios";


function Registration () {

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    password_confirmation: "",
    about: "",
    skills: "",
    causes: [],
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if password and password_confirmation match
    if (formData.password !== formData.password_confirmation) {
      alert("Passwords do not match. Please try again.");
      return; 
    }
    
    // If passwords match, proceed with the API call
    axios.post("http://localhost:5000/auth/register", formData)
      .then((res) => {
        
        if (res.data.status === "success") {
          alert("Registration successful. Please login to continue.");
          navigate("/login");
        } else {
          alert(res.data.message || "Registration failed");
        }
      })
      .catch((err) => {
        if (err.response) {
          alert(typeof err.response.data === 'string' ? 
                err.response.data : 
                (err.response.data.message || "Registration failed"));
        } else if (err.request) {
          alert("No response from server. Please try again.");
        } else {
          alert("Error: " + err.message);
        }
      });
  };

  return (
    <>
    <NavBar />
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-5">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-blue-800">
            Create a new account
        </h2>
        <p className="mt-2 text-center text-sm leading-5 text-gray-500 max-w">
          <Link
            to="/login"
            className="font-medium text-grey-600 hover:text-blue-800 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            Or login to your account
          </Link>
        </p>
    </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit}>
                <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  required
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
                <div className="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                            </svg>
                        </div>
                    </div>
                </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 rounded-md shadow-sm">
                  <select
                    id="gender"
                    name="gender"
                    required
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  >
                    <option value="" disabled selected>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 rounded-md shadow-sm">
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  />
                </div>
                    </div>
                </div>

            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  placeholder="user@example.com"
                  type="email"
                  required
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
                <div className="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                            </svg>
                        </div>
                    </div>
                </div>

            <div className="mt-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
                    </div>
                </div>

            <div className="mt-6">
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="bio"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                About
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  placeholder="Tell us a bit about yourself and why you want to volunteer..."
                  maxLength="1000"
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                ></textarea>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="skills"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="e.g., Teaching, First Aid, Web Development, Cooking, Photography"
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter your skills separated by commas. These will help match you with relevant volunteer opportunities.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="causes"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Causes You Support <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <select
                  id="causes"
                  name="causes"
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
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (or Cmd on Mac) to select multiple causes. These will help match you with opportunities aligned with your interests.
                </p>
                    </div>
                </div>

            <div className="mt-6">
              <span className="block w-full rounded-md shadow-sm">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                >
                            Create account
                        </button>
                    </span>
                </div>
            </form>
        </div>
    </div>
</div>
</>
  );
};

export default Registration;