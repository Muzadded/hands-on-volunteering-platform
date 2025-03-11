import client from "../db.js";

export const getUserByIdService = async (id) => {
    try {
        const result = await client.query(
            "SELECT user_id, name, gender, dob, email, about, skills, causes FROM users WHERE user_id = $1",
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in getUserByIdService:', error);
        throw new Error('Failed to fetch user');
    }
};




