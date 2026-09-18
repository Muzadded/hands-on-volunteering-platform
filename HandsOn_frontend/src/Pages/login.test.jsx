import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../Pages/login";

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: () => ({ user: 99 }),
}));

import api from "../api/client";

describe("Login form", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(
      <MemoryRouter>
        <Login setAuth={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("stores token and calls setAuth on success", async () => {
    api.post.mockResolvedValue({ data: { token: "abc.def.ghi" } });
    const setAuth = vi.fn();

    render(
      <MemoryRouter>
        <Login setAuth={setAuth} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@handson.local" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "DemoPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "demo@handson.local",
        password: "DemoPass123!",
      });
      expect(localStorage.getItem("token")).toBe("abc.def.ghi");
      expect(setAuth).toHaveBeenCalledWith(true, 99);
    });
  });

  it("shows error message on failed login", async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "Invalid Password" } },
    });

    render(
      <MemoryRouter>
        <Login setAuth={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@handson.local" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument();
  });
});
