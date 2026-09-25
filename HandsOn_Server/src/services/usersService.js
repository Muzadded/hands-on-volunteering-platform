import * as usersRepo from "../repositories/usersRepository.js";
import * as eventsRepo from "../repositories/eventsRepository.js";
import * as helpRepo from "../repositories/helpPostsRepository.js";
import { AppError } from "../utils/response.js";
import { hoursBetween, normalizeTags } from "../utils/matching.js";

function toPublicUser(user) {
  if (!user) return null;
  return {
    user_id: user.user_id,
    name: user.name,
    about: user.about,
    skills: user.skills || [],
    causes: user.causes || [],
  };
}

function toPublicImpact(impact) {
  return {
    hoursVolunteered: impact.hoursVolunteered,
    eventsAttended: impact.eventsAttended,
    teamsJoined: impact.teamsJoined,
    helpContributions: impact.helpContributions,
  };
}

export async function getMe(userId) {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function getImpact(userId) {
  const [attended, teams, help] = await Promise.all([
    eventsRepo.attendedEventsForUser(userId),
    usersRepo.findJoinedTeams(userId),
    helpRepo.countContributions(userId),
  ]);

  const hours = attended.reduce((sum, event) => {
    if (event.starts_at && event.ends_at) {
      return sum + hoursBetween(event.starts_at, event.ends_at);
    }
    return sum + hoursBetween(event.start_time, event.end_time);
  }, 0);

  return {
    hoursVolunteered: Math.round(hours * 100) / 100,
    eventsAttended: attended.length,
    teamsJoined: teams.length,
    helpCreated: help.created,
    helpClaimed: help.claimed,
    helpComments: help.comments,
    helpContributions: help.created + help.claimed + help.comments,
  };
}

export async function getUserProfile(actorId, targetId) {
  const user = await usersRepo.findById(targetId);
  if (!user) throw new AppError("User not found", 404);

  const isSelf = String(actorId) === String(targetId);
  const impact = await getImpact(targetId);

  if (!isSelf) {
    return {
      user: toPublicUser(user),
      impact: toPublicImpact(impact),
      isSelf: false,
    };
  }

  const joinedEvents = (await usersRepo.findJoinedEvents(targetId)).map((event) => ({
    ...event,
    registeredVolunteers: parseInt(event.registered_volunteers, 10) || 0,
    member_limit: event.member_limit || null,
    user_joined: true,
  }));

  const joinedTeams = (await usersRepo.findJoinedTeams(targetId)).map((team) => ({
    ...team,
    member_count: parseInt(team.member_count, 10) || 0,
  }));

  return {
    user,
    joinedEvents,
    joinedTeams,
    impact,
    isSelf: true,
  };
}

export async function updateOwnProfile(actorId, targetId, payload) {
  if (String(actorId) !== String(targetId)) {
    throw new AppError("Not authorized to update this profile", 403);
  }

  const skills = normalizeTags(payload.skills);
  let causes = payload.causes;
  if (causes == null) causes = [];
  else if (!Array.isArray(causes)) causes = normalizeTags(causes);
  else causes = normalizeTags(causes);

  const updated = await usersRepo.updateProfile(targetId, {
    name: payload.name,
    gender: payload.gender,
    dob: payload.dob,
    about: payload.about ?? null,
    skills,
    causes,
  });

  if (!updated) throw new AppError("User not found", 404);
  return updated;
}
