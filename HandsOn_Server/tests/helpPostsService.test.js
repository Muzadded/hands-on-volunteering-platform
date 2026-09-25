import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/helpPostsRepository.js", () => ({
  createHelpPost: vi.fn(),
  listHelpPosts: vi.fn(),
  findHelpPostById: vi.fn(),
  listComments: vi.fn(),
  addComment: vi.fn(),
  claimHelpPost: vi.fn(),
  updateHelpPost: vi.fn(),
  deleteHelpPost: vi.fn(),
}));

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../src/services/notificationsService.js", () => ({
  notify: vi.fn(),
}));

import * as helpRepo from "../src/repositories/helpPostsRepository.js";
import * as usersRepo from "../src/repositories/usersRepository.js";
import {
  createHelpPost,
  claimHelpPost,
  updateHelpPost,
  deleteHelpPost,
} from "../src/services/helpPostsService.js";

describe("helpPostsService phase 1-2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates ask and offer posts with category and title", async () => {
    helpRepo.createHelpPost.mockResolvedValue({ help_post_id: 1, post_type: "offer" });

    await createHelpPost(3, {
      title: "Going to the bazar",
      details: "Can pick up groceries",
      location: "Mirpur",
      urgency_level: "low",
      post_type: "offer",
      category: "groceries",
    });

    expect(helpRepo.createHelpPost).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: 3,
        title: "Going to the bazar",
        post_type: "offer",
        category: "groceries",
      })
    );
  });

  it("defaults type/category and derives title from details", async () => {
    helpRepo.createHelpPost.mockResolvedValue({ help_post_id: 2 });

    await createHelpPost(1, {
      details: "Need medicine pickup today please",
      location: "Dhanmondi",
      urgency_level: "urgent",
    });

    expect(helpRepo.createHelpPost).toHaveBeenCalledWith(
      expect.objectContaining({
        post_type: "ask",
        category: "other",
        title: "Need medicine pickup today please",
      })
    );
  });

  it("rejects invalid category", async () => {
    await expect(
      createHelpPost(1, {
        details: "x",
        location: "y",
        urgency_level: "low",
        category: "not-a-real-category",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("blocks claiming own post", async () => {
    helpRepo.findHelpPostById.mockResolvedValue({
      help_post_id: 9,
      created_by: 5,
      status: "open",
      claimed_by: null,
    });
    await expect(claimHelpPost(5, 9)).rejects.toMatchObject({ statusCode: 400 });
  });

  it("allows owner to edit content fields", async () => {
    helpRepo.findHelpPostById.mockResolvedValue({
      help_post_id: 4,
      created_by: 2,
      claimed_by: null,
      status: "open",
    });
    helpRepo.updateHelpPost.mockResolvedValue({ help_post_id: 4, title: "Updated" });

    await updateHelpPost(2, 4, { title: "Updated", category: "ride" });
    expect(helpRepo.updateHelpPost).toHaveBeenCalledWith(
      4,
      expect.objectContaining({ title: "Updated", category: "ride" })
    );
  });

  it("blocks helper from editing content", async () => {
    helpRepo.findHelpPostById.mockResolvedValue({
      help_post_id: 4,
      created_by: 2,
      claimed_by: 7,
      status: "in_progress",
    });
    await expect(updateHelpPost(7, 4, { title: "Nope" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows owner to delete; admin can delete others", async () => {
    helpRepo.findHelpPostById.mockResolvedValue({
      help_post_id: 8,
      created_by: 2,
    });
    helpRepo.deleteHelpPost.mockResolvedValue({ help_post_id: 8 });

    await deleteHelpPost(2, 8);
    expect(helpRepo.deleteHelpPost).toHaveBeenCalledWith(8);

    usersRepo.findById.mockResolvedValue({ user_id: 99, platform_role: "user" });
    await expect(deleteHelpPost(99, 8)).rejects.toMatchObject({ statusCode: 403 });

    usersRepo.findById.mockResolvedValue({ user_id: 1, platform_role: "admin" });
    await deleteHelpPost(1, 8);
  });
});
