import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaComment,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const HelpReq = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [helpPosts, setHelpPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [refreshData, setRefreshData] = useState(false);

  // Fetch all help posts
  useEffect(() => {
    const fetchHelpPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/get-help-posts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          setHelpPosts(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching help posts:", err);

        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          setAuth(false);
          navigate("/login");
        }
      }
    };

    fetchHelpPosts();
  }, [navigate, setAuth, refreshData]);

  // Fetch post details when a post is selected
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!selectedPost) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/help-post/${selectedPost}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          setPostDetails(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
      }
    };

    fetchPostDetails();
  }, [selectedPost, navigate, refreshData]);

  const handlePostSelect = (postId) => {
    console.log("handlePostSelect Selected post ID:", postId);
    setSelectedPost(postId);
    setComment("");
  };

  const handleAddComment = async () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.user;
    console.log("handleAddComment Selected post ID:", selectedPost);
    console.log("handleAddComment User ID:", userId);
    console.log("handleAddComment Comment:", comment);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/help-post/comment",
        {
          postId: selectedPost,
          userId: userId,
          comment: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComment("");
      setRefreshData(!refreshData); // Trigger a refresh
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  const getUrgencyBadge = (urgencyLevel) => {
    switch (urgencyLevel) {
      case "urgent":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationCircle className="mr-1" /> Urgent
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationTriangle className="mr-1" /> Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaInfoCircle className="mr-1" /> Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaInfoCircle className="mr-1" /> Not specified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="container mx-auto px-4 py-6 max-w-3xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Help Requests
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Support your community by helping others
                </p>
              </div>

              <button
                onClick={() => navigate("/create-help-post")}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200 ease-in-out"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                New Request
              </button>
            </div>

            {/* Help Posts Feed */}
            <div className="space-y-6">
              {helpPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-gray-500">No help requests available</p>
                </div>
              ) : (
                helpPosts.map((post) => (
                  <div
                    key={post.help_post_id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    {/* Post Header */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-700">
                              {post.requester_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {post.requester_name}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FaMapMarkerAlt className="mr-1" />
                            <span>{post.location}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getUrgencyBadge(post.urgency_level)}
                        </div>
                      </div>
                      {/* Post Content */}
                      <p className="mt-3 text-sm text-gray-600">
                        {post.details}
                      </p>

                      {/* Comment Count */}
                      <div className="mt-4 flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <FaComment className="mr-1 text-blue-500" />
                          {post.comment_count || 0} comments
                        </span>
                      </div>
                    </div>

                    {/* Comment Buttons */}
                    <div className="border-t border-gray-100 px-4 py-3 flex space-x-3">
                      <button
                        onClick={() => handlePostSelect(post.help_post_id)}
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <FaComment className="mr-1.5 h-3 w-3" /> Comment
                      </button>
                    </div>

                    {/*  Comment details */}
                    {selectedPost === post.help_post_id && postDetails && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        {/* Comments Section */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Comments
                          </h4>
                          <div className="space-y-2">
                            {postDetails.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-white p-3 rounded-md shadow-sm border border-gray-100"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.commenter_name}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {comment.comment}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment Form */}
                          <div className="mt-3">
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full px-3 py-2 text-sm border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="2"
                            ></textarea>
                            <button
                              onClick={handleAddComment}
                              disabled={!comment.trim()}
                              className={`mt-2 px-4 py-2 text-sm font-medium rounded-md ${
                                comment.trim()
                                  ? "bg-purple-600 text-white hover:bg-purple-700"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Post Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpReq;
