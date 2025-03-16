import client from "../db.js";

export const getUserByIdService = async (id) => {
  try {
    // Get user basic information
    const userResult = await client.query(
      "SELECT user_id, name, gender, dob, email, about, skills, causes FROM users WHERE user_id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];

    // Get events the user has joined with join dates
    const joinedEventsQuery = `
            SELECT e.*, je.join_date,
                   (SELECT COUNT(*) FROM join_event WHERE event_id = e.id) as registered_volunteers
            FROM events e
            INNER JOIN join_event je ON e.id = je.event_id
            WHERE je.user_id = $1
            ORDER BY e.date DESC
        `;

    const joinedEventsResult = await client.query(joinedEventsQuery, [id]);

    // Format the joined events data
    const joinedEvents = joinedEventsResult.rows.map((event) => ({
      ...event,
      registeredVolunteers: parseInt(event.registered_volunteers) || 0,
      member_limit: event.member_limit || null,
      user_joined: true, // Since these are events the user has joined
    }));

    return {
      user: user,
      joinedEvents: joinedEvents,
    };
  } catch (error) {
    console.error("Error in getUserByIdService:", error);
    throw new Error(error.message || "Failed to fetch user");
  }
};

export const updateUserService = async (
  id,
  name,
  gender,
  dob,
  about,
  skills,
  causes
) => {
  try {
    if (!id) {
      throw new Error("In Model User ID is required");
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
    console.error("Error in updateUserService:", error);
    throw new Error("Failed to update user");
  }
};

export const createEventService = async (
  id,
  title,
  details,
  date,
  location,
  start_time,
  end_time,
  category,
  member_limit
) => {
  try {
    console.log("Creating event with data:", {
      id,
      title,
      details,
      date,
      location,
      start_time,
      end_time,
      category,
      member_limit,
    });

    const memberLimit = member_limit ? parseInt(member_limit, 10) : null;

    const result = await client.query(
      `INSERT INTO events (title, details, date, location, start_time, end_time, category, member_limit, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
      [
        title,
        details,
        date,
        location,
        start_time,
        end_time,
        category,
        memberLimit,
        id,
      ]
    );

    //get the event id
    const event_id = result.rows[0].id;

    // Insert join record for the creator
    const result_join_event = await client.query(
      "INSERT INTO join_event (event_id, user_id, join_date) VALUES ($1, $2, $3) RETURNING *",
      [event_id, id, date]
    );

    if (result.rows.length === 0) {
      throw new Error("Failed to create event - no rows returned");
    }
    console.log("Event created successfully:", result.rows[0]);
    return {
      event: result.rows[0],
      joinData: result_join_event.rows[0],
    };
  } catch (error) {
    console.error("Error in createEventService:", error);
    throw new Error("Failed to create event");
  }
};

export const getAllEventsService = async (user_id = null) => {
  try {
    const Query = `
            SELECT e.*,
                   COUNT(je.event_id) as registered_volunteers,
                   ${
                     user_id
                       ? "EXISTS(SELECT 1 FROM join_event WHERE event_id = e.id AND user_id = $1)"
                       : "FALSE"
                   } as user_joined
            FROM events e 
            LEFT JOIN join_event je ON e.id = je.event_id
            GROUP BY e.id ORDER BY e.date DESC
        `;

    const queryParams = user_id ? [user_id] : [];

    const result = await client.query(Query, queryParams);

    return result.rows.map((event) => ({
      ...event,
      registeredVolunteers: parseInt(event.registered_volunteers) || 0,
      member_limit: event.member_limit || null,
      user_joined: event.user_joined || false,
    }));
  } catch (error) {
    console.error("Error in getAllEventsService:", error);
    throw new Error("Failed to get events");
  }
};

export const joinEventService = async (event_id, user_id, join_date) => {
  try {
    // Check if event has available spots
    const eventCheck = await client.query(
      "SELECT * FROM events WHERE id = $1",
      [event_id]
    );
    const event = eventCheck.rows[0];

    if (event.total_member >= event.member_limit) {
      throw new Error("Event is already full");
    }

    // Insert join record
    const result = await client.query(
      "INSERT INTO join_event (event_id, user_id, join_date) VALUES ($1, $2, $3) RETURNING *",
      [event_id, user_id, join_date]
    );

    // Update event total members
    const updatedEvent = await client.query(
      "UPDATE events SET total_member = total_member + 1 WHERE id = $1 RETURNING *",
      [event_id]
    );

    return {
      joinData: result.rows[0],
      event: updatedEvent.rows[0],
    };
  } catch (error) {
    console.error("Error in joinEventService:", error);
    throw new Error(error.message || "Failed to join event");
  }
};

export const createHelpPostService = async (
  id,
  details,
  location,
  urgency_level
) => {
  try {
    const result = await client.query(
      "INSERT INTO help_post (created_by, details, location, urgency_level) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, details, location, urgency_level]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in createHelpPostService:", error);
    throw new Error("Failed to create help post");
  }
};

export const getHelpPostsService = async () => {
  try {
    const result = await client.query(`
          SELECT hp.*, u.name as requester_name,
                 (SELECT COUNT(*) FROM help_post_comments WHERE help_post_comments.help_post_id = hp.help_post_id) as comment_count
          FROM help_post hp
          JOIN users u ON hp.created_by = u.user_id
          ORDER BY
              CASE
                  WHEN hp.urgency_level = 'urgent' THEN 1
                  WHEN hp.urgency_level = 'medium' THEN 2
                  WHEN hp.urgency_level = 'low' THEN 3
                  ELSE 4
              END,
              hp.created_at DESC
      `);
    return result.rows;
  } catch (error) {
    console.error("Error in getHelpPostsService:", error);
    throw new Error("Failed to get help posts");
  }
};

export const getHelpPostByIdService = async (postId) => {
  try {
    const postResult = await client.query(
      `
          SELECT hp.*, u.name as requester_name
          FROM help_post hp
          JOIN users u ON hp.created_by = u.user_id
          WHERE hp.help_post_id = $1
      `,
      [postId]
    );

    if (postResult.rows.length === 0) {
      throw new Error("Help post not found");
    }

    const commentsResult = await client.query(
      `
          SELECT hpc.*, u.name as commenter_name
          FROM help_post_comments hpc
          JOIN users u ON hpc.user_id = u.user_id
          WHERE hpc.help_post_id = $1
          ORDER BY hpc.created_at ASC
      `,
      [postId]
    );

    return {
      post: postResult.rows[0],
      comments: commentsResult.rows,
    };
  } catch (error) {
    console.error("Error in getHelpPostByIdService:", error);
    throw new Error(error.message || "Failed to get help post details");
  }
};

export const addCommentToHelpPostService = async (postId, userId, comment) => {
  try {
    const result = await client.query(
      "INSERT INTO help_post_comments (help_post_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *",
      [postId, userId, comment]
    );

    // Get the commenter's name
    const userResult = await client.query(
      "SELECT name FROM users WHERE user_id = $1",
      [userId]
    );

    const commentData = result.rows[0];
    return {
      ...commentData,
      commenter_name: userResult.rows[0]?.name || "Unknown User",
    };
  } catch (error) {
    console.error("Error in addCommentToHelpPostService:", error);
    throw new Error("Failed to add comment");
  }
};

export const createTeamService = async (name, description, category, isPrivate, created_by) => {
  try {
    const result = await client.query(
      "INSERT INTO teams (name, description, category, is_private, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, category, isPrivate, created_by]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in createTeamService:", error);
    throw new Error("Failed to create team");
  }
};

