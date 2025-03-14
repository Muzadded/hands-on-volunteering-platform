import { getUserByIdService, updateUserService, createEventService, createHelpPostService, getHelpPostsService, getAllEventsService, joinEventService, checkUserJoinedEventService } from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
    const isError = status >= 400;
    res.status(status).json({
        status: isError ? 'error' : 'success',
        message,
        data,
    });
};

export const getUserById = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);
        
        if (!user) {
            return handleResponse(res, 404, "User not found");
        }

        handleResponse(res, 200, "User fetched successfully", {
            id: user.user_id,
            name: user.name || '',
            email: user.email || '',
            gender: user.gender || '',
            dob: user.dob || '',
            skills: user.skills || [],
            causes: user.causes || [],
            about: user.about || ''
        });
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
        const updateUser = await updateUserService(userId, name, gender, dob, about, skills, causes);
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
        if (!title || !details || !date || !location || !start_time || !end_time || !category || !member_limit) {
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
}

export const createHelpPost = async (req, res, next) => {
    const {details, location} = req.body;
    try {
        // Validate required fields
        if (!details || !location) {
            return handleResponse(res, 400, "Missing required fields");
        }

        console.log("Creating help post for user with ID:", req.params.id);
        const newHelpPost = await createHelpPostService(req.params.id, details, location);
        handleResponse(res, 200, "Help post created successfully", newHelpPost);
    }
    catch (error) {
        console.error("Error in createHelpPost:", error);
        handleResponse(res, 500, error.message || "Internal server error");
        next(error);
    }
}

export const getAllHelpPosts = async (req, res, next) => {
    try {
        const helpPosts = await getHelpPostsService();
        handleResponse(res, 200, "Help posts fetched successfully", helpPosts);
    }
    catch (error) {
        console.error("Error in getAllHelpPosts:", error);
        handleResponse(res, 500, error.message || "Internal server error");
        next(error);
    }
}

export const getAllEvents = async (req, res, next) => {
    try {
        const { category, location, date, user_id } = req.query;
        
        const events = await getAllEventsService(category, location, date, user_id);
        handleResponse(res, 200, "Events fetched successfully", events);
    } catch (error) {
        console.error("Error in getAllEvents:", error);
        handleResponse(res, 500, error.message || "Internal server error");
        next(error);
    }
}

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
    }
    catch (error) {
        console.error("Error in joinEvent:", error);
        handleResponse(res, 400, error.message || "Failed to join event");
        next(error);
    }
}


export const checkUserJoinedEvent = async (req, res, next) => {
    try {
        const { event_id, user_id } = req.query;
        // Validate required fields
        if (!event_id) {
            return handleResponse(res, 400, "Event ID is required");
        }
        if (!user_id) {
            return handleResponse(res, 400, "User ID is required");
        }
        
        const result = await checkUserJoinedEventService(event_id, user_id);
        handleResponse(res, 200, "User join status checked successfully", result);
        
    } catch (error) {
        console.error("Error in checkUserJoinedEvent:", error);
        handleResponse(res, 400, error.message || "Failed to check if user joined event");
        next(error);
    }
}





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

