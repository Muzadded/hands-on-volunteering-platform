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
        summary: "List help posts",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create help post",
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
