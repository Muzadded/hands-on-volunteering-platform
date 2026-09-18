// Deprecated god-file — logic lives in src/{repositories,services,controllers}
export * from "../src/controllers/usersController.js";
export {
  createEvent,
  listEvents as getAllEvents,
  joinEvent,
} from "../src/controllers/eventsController.js";
export {
  createHelpPost,
  listHelpPosts as getAllHelpPosts,
  getHelpPost as getHelpPostById,
  addComment as addCommentToHelpPost,
} from "../src/controllers/helpPostsController.js";
export {
  createTeam,
  listTeams as getAllTeams,
  joinTeam,
  getTeam as getTeamById,
} from "../src/controllers/teamsController.js";
