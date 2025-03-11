import { getUserByIdService } from "../models/userModel.js";

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
            id: user.id,
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
