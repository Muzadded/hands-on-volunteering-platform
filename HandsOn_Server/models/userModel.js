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

export const updateUserService = async (id, name, gender, dob, about, skills, causes) => {
    try {

        const aboutValue = about === null || about === undefined ? null : about;
        
        let skillsValue = skills;
        if (skills === null || skills === undefined) {
            skillsValue = [];
        } else if (!Array.isArray(skills)) {
            skillsValue = [skills];
        }
        
        let causesValue = causes;
        if (causes === null || causes === undefined) {
            causesValue = [];
        } else if (!Array.isArray(causes)) {
            causesValue = [causes];
        }

        const result = await client.query(
            "UPDATE users SET name = $1, gender = $2, dob = $3, about = $4, skills = $5, causes = $6 WHERE user_id = $7 RETURNING *",
            [name, gender, dob, aboutValue, skillsValue, causesValue, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateUserService:', error);
        throw new Error('Failed to update user');
    }
};






