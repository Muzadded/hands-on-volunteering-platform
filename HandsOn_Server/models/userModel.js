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
        if (!id) {
            throw new Error('In Model User ID is required');
        }

        const aboutValue = about === null || about === undefined ? null : about;
        
        let skillsValue = skills;
        if (skills === null || skills === undefined) {
            skillsValue = null;
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

export const createEventService = async (id, title, details, date, location, start_time, end_time, category, member_limit) => {
    try {
        console.log("Creating event with data:", {
            id, title, details, date, location, start_time, end_time, category, member_limit
        });
        
        // Convert member_limit to integer if it's a string
        const memberLimit = member_limit ? parseInt(member_limit, 10) : null;
        
        const result = await client.query(
            `INSERT INTO events (title, details, date, location, start_time, end_time, category, member_limit, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [title, details, date, location, start_time, end_time, category, memberLimit, id]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Failed to create event - no rows returned');
        }
        console.log("Event created successfully:", result.rows[0]);
        return result.rows[0];

    } catch (error) {
        console.error('Error in createEventService:', error);
        throw new Error('Failed to create event');
    }
};

export const createHelpPostService = async (id, details, location) => {
    try {
        const result = await client.query(
            "INSERT INTO help_post (created_by, details, location) VALUES ($1, $2, $3) RETURNING *",
            [id, details, location]
        );  
        return result.rows[0];
    } catch (error) {
        console.error('Error in createHelpPostService:', error);
        throw new Error('Failed to create help post');
    }
};

export const getHelpPostsService = async () => {
    try {
        const result = await client.query(
            "SELECT * FROM help_post"
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getHelpPostsService:', error);
        throw new Error('Failed to get help posts');
    }
};

export const getAllEventsService = async () => {
    try {
        const result = await client.query(
            "SELECT * FROM events"
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getAllEventsService:', error);
        throw new Error('Failed to get all events');
    }
};






