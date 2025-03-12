import { getUserByIdService, updateUserService } from "../models/userModel.js";

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
    const {name, gender, dob, about, skills, causes} = req.body;
    try {
        console.log("Updating user with ID:", req.params.id);
        const updateUser = await updateUserService(req.params.id, name, gender, dob, about, skills, causes);
        if (!updateUser) return handleResponse(res, 404, "User still still not found");
        handleResponse(res, 200, "User updated successfully", updateUser);
    }
    catch (error) {
        console.error("Error in updateUser:", error);
        handleResponse(res, 500, error.message || "Internal server error");
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

