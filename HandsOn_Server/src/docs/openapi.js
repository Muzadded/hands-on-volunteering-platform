export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HandsOn API",
    version: "1.0.0",
    description: "Community volunteering platform API (v1)",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { 200: { description: "Service healthy" } },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register",
        responses: { 201: { description: "Registered" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        responses: { 200: { description: "Authenticated" } },
      },
    },
    "/users/me": {
      get: {
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Get user profile",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "OK" } },
      },
      patch: {
        summary: "Update own profile",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Updated" } },
      },
    },
    "/events": {
      get: {
        summary: "List events",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create event",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/events/{id}/join": {
      post: {
        summary: "Join event",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Joined" } },
      },
    },
    "/help-posts": {
      get: {
        summary: "List help posts (filters: status, urgency, post_type, category, lat/lng/radius_km)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create help post (ask|offer, category, optional lat/lng)",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/help-posts/{id}/comments": {
      post: {
        summary: "Add comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 201: { description: "Created" } },
      },
    },
    "/help-posts/{id}/claim": {
      post: {
        summary: "Claim help post (reveals exact address to claimer)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Claimed" } },
      },
    },
    "/help-posts/{id}/invites": {
      post: {
        summary: "Invite nearby helpers",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 201: { description: "Invites sent" } },
      },
    },
    "/help-posts/invites/{inviteId}/respond": {
      post: {
        summary: "Accept/decline invite (accept shares contact + meeting time)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Updated" } },
      },
    },
    "/help-posts/{id}/reviews": {
      post: {
        summary: "Leave a 1-5 review after resolved",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/help-posts/reports": {
      post: {
        summary: "Report a help post or user",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/help-posts/moderation/reports": {
      get: {
        summary: "Admin moderation queue",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/teams": {
      get: {
        summary: "List teams",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create team",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/teams/{id}": {
      get: {
        summary: "Team details",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/teams/{id}/join": {
      post: {
        summary: "Join team",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Joined" } },
      },
    },
  },
};
