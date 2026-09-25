import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/jobsRepository.js", () => ({
  enqueue: vi.fn(async (row) => ({ id: 1, ...row })),
  cancelByDedupePrefix: vi.fn(async () => []),
  claimNextBatch: vi.fn(async () => []),
  markCompleted: vi.fn(),
  markFailed: vi.fn(),
}));

vi.mock("../src/repositories/usersRepository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../src/utils/mailer.js", () => ({
  sendMail: vi.fn(async () => ({ queued: true })),
}));

vi.mock("../src/utils/sms.js", () => ({
  sendSms: vi.fn(async () => ({ queued: true })),
}));

vi.mock("../src/repositories/messagingRepository.js", () => ({
  renderTemplate: (t, vars) =>
    String(t).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? ""),
  logMessage: vi.fn(async () => ({ id: 1 })),
  createTemplate: vi.fn(),
  listTemplates: vi.fn(),
  findTemplate: vi.fn(),
}));

import * as usersRepo from "../src/repositories/usersRepository.js";
import { sendMail } from "../src/utils/mailer.js";
import { sendSms } from "../src/utils/sms.js";
import { deliverToUser } from "../src/services/messagingService.js";
import {
  enqueueJob,
  processOnce,
  registerJobHandler,
} from "../src/services/jobsService.js";
import * as jobsRepo from "../src/repositories/jobsRepository.js";

describe("messaging + jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delivers email and sms according to preferences", async () => {
    usersRepo.findById.mockResolvedValue({
      user_id: 1,
      name: "Ada",
      email: "ada@test.local",
      phone: "01700000000",
      notify_email: true,
      notify_sms: true,
    });

    await deliverToUser(1, "join_confirmed", { eventTitle: "Park Cleanup" });
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendSms).toHaveBeenCalledOnce();
  });

  it("skips sms when preference is off", async () => {
    usersRepo.findById.mockResolvedValue({
      user_id: 1,
      name: "Ada",
      email: "ada@test.local",
      phone: "01700000000",
      notify_email: true,
      notify_sms: false,
    });
    await deliverToUser(1, "join_confirmed", { eventTitle: "Park Cleanup" });
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("processes queued jobs with registered handlers", async () => {
    const handler = vi.fn(async () => {});
    registerJobHandler("test_job", handler);
    jobsRepo.claimNextBatch.mockResolvedValueOnce([
      { id: 9, job_type: "test_job", payload: { ok: true }, attempts: 1 },
    ]);
    const count = await processOnce();
    expect(count).toBe(1);
    expect(handler).toHaveBeenCalledWith({ ok: true }, expect.any(Object));
    expect(jobsRepo.markCompleted).toHaveBeenCalledWith(9);
  });

  it("enqueues jobs", async () => {
    await enqueueJob("deliver_channels", { userId: 1 });
    expect(jobsRepo.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ jobType: "deliver_channels" })
    );
  });
});
