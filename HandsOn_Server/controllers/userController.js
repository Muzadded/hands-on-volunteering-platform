import {
  getUserByIdService,
  updateUserService,
  createEventService,
  createHelpPostService,
  getAllEventsService,
  joinEventService,
  getHelpPostsService,
  getHelpPostByIdService,
  addCommentToHelpPostService,
  createTeamService,
  getAllTeamsService,
  joinTeamService,
  getTeamByIdService,
} from "../models/userModel.js";
import jwt from "jsonwebtoken";

const handleResponse = (res, status, message, data = null) => {
  const isError = status >= 400;
  res.status(status).json({
    status: isError ? "error" : "success",
    message,
    data,
  });
};

export const getUserById = async (req, res) => {
  try {
    const userData = await getUserByIdService(req.params.id);

    if (!userData || !userData.user) {
      return handleResponse(res, 404, "User not found");
    }

    handleResponse(res, 200, "User fetched successfully", userData);
  } catch (error) {
    console.error("Error in getUserById:", error);
    handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const updateUser = async (req, res, next) => {
  const { name, gender, dob, about, skills, causes } = req.body;
  const userId = req.params.id;

  if (!userId) {
    return handleResponse(res, 400, "in Controller User ID is required");
  }

  try {
    console.log("Updating user with ID:", userId);
    const updateUser = await updateUserService(
      userId,
      name,
      gender,
      dob,
      about,
      skills,
      causes
    );
    if (!updateUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User updated successfully", updateUser);
  } catch (error) {
    console.error("Error in updateUser:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      details,
      date,
      location,
      start_time,
      end_time,
      category,
      member_limit,
    } = req.body;

    // Log the request body for debugging
    console.log("Create Event Request Body:", req.body);
    console.log("User ID from params:", req.params.id);

    // Validate required fields
    if (
      !title ||
      !details ||
      !date ||
      !location ||
      !start_time ||
      !end_time ||
      !category ||
      !member_limit
    ) {
      return handleResponse(res, 400, "Missing required fields");
    }

    // Create the event
    const newEvent = await createEventService(
      req.params.id,
      title,
      details,
      date,
      location,
      start_time,
      end_time,
      category,
      member_limit
    );

    handleResponse(res, 201, "Event created successfully", newEvent);
  } catch (error) {
    console.error("Error in createEvent:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    const events = await getAllEventsService(user_id);
    handleResponse(res, 200, "Events fetched successfully", events);
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const joinEvent = async (req, res, next) => {
  const { event_id, user_id, join_date } = req.body;
  try {
    // Validate required fields
    if (!event_id) {
      return handleResponse(res, 400, "Event ID is required");
    }
    if (!user_id) {
      return handleResponse(res, 400, "User ID is required");
    }

    const result = await joinEventService(event_id, user_id, join_date);
    handleResponse(res, 200, "Event joined successfully", result);
  } catch (error) {
    console.error("Error in joinEvent:", error);
    handleResponse(res, 400, error.message || "Failed to join event");
    next(error);
  }
};

export const createHelpPost = async (req, res, next) => {
  const { details, location, urgency_level } = req.body;
  try {
    //console.log("Creating help post for user with ID:", req.params.id);
    const newHelpPost = await createHelpPostService(
      req.params.id,
      details,
      location,
      urgency_level
    );
    handleResponse(res, 201, "Help post created successfully", newHelpPost);
  } catch (error) {
    console.error("Error in createHelpPost:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const getAllHelpPosts = async (req, res, next) => {
  try {
    const helpPosts = await getHelpPostsService();
    handleResponse(res, 200, "Help posts fetched successfully", helpPosts);
  } catch (error) {
    console.error("Error in getAllHelpPosts:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const getHelpPostById = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return handleResponse(res, 400, "Help post ID is required");
    }

    const helpPostData = await getHelpPostByIdService(postId);
    handleResponse(
      res,
      200,
      "Help post details fetched successfully",
      helpPostData
    );
  } catch (error) {
    console.error("Error in getHelpPostById:", error);
    handleResponse(
      res,
      error.message === "Help post not found" ? 404 : 500,
      error.message || "Internal server error"
    );
    next(error);
  }
};

export const addCommentToHelpPost = async (req, res, next) => {
  try {
    const { postId, userId, comment } = req.body;

    // Validate required fields
    if (!postId || !userId || !comment) {
      return handleResponse(res, 400, "Missing required fields");
    }

    const newComment = await addCommentToHelpPostService(
      postId,
      userId,
      comment
    );
    handleResponse(res, 201, "Comment added successfully", newComment);
  } catch (error) {
    console.error("Error in addCommentToHelpPost:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  const { name, description, category, isPrivate, created_by } = req.body;
  try {
    const newTeam = await createTeamService(name, description, category, isPrivate, created_by);
    handleResponse(res, 201, "Team created successfully", newTeam);
  } catch (error) {
    console.error("Error in createTeam:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.decode(token);
        userId = decoded.user;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    const teams = await getAllTeamsService(userId);
    handleResponse(res, 200, "Teams fetched successfully", teams);
  } catch (error) {
    console.error("Error in getAllTeams:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const joinTeam = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const teamId = req.params.teamId;

    // Validate required fields
    if (!teamId) {
      return handleResponse(res, 400, "Team ID is required");
    }
    if (!userId) {
      return handleResponse(res, 400, "User ID is required");
    }

    const result = await joinTeamService(teamId, userId);
    handleResponse(res, 200, "Team joined successfully", result);
  } catch (error) {
    console.error("Error in joinTeam:", error);
    handleResponse(res, 500, error.message || "Internal server error");
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.decode(token);
        userId = decoded.user;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    const teamData = await getTeamByIdService(teamId, userId);
    handleResponse(res, 200, "Team details fetched successfully", teamData);
    
  } catch (error) {
    console.error("Error in getTeamById:", error);
    handleResponse(
      res,
      error.message === "Team not found" ? 404 : 500,
      error.message || "Internal server error"
    );
    next(error);
  }
};
// export const test = async (req, res) => {
//     try {
//         console.log("Test endpoint called");
//         res.status(200).json({
//             status: 'success',
//             message: 'Test endpoint working correctly',
//             data: { test: 'Hello World' }
//         });
//     } catch (error) {
//         console.error("Error in test endpoint:", error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Test endpoint failed',
//             error: error.message
//         });
//     }
// };
