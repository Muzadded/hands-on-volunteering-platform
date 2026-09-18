import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaGlobe, FaLock } from "react-icons/fa";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

function roleTone(role) {
  if (role === "owner") return "clay";
  if (role === "admin") return "teal";
  return "muted";
}

export default function TeamDash({ setAuth }) {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/teams/${teamId}`);
      setTeam(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) {
      setError("Team ID is missing");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const canManage = team?.my_role === "owner" || team?.my_role === "admin";

  const createInvite = async () => {
    try {
      const res = await api.post(`/teams/${teamId}/invites`);
      setInviteCode(res.data?.data?.code || "");
      toast.success("Invite code created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invite");
    }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      toast.success("Member removed");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const joinWithCode = async () => {
    try {
      const res = await api.post("/teams/join-by-code", { code: joinCode.trim() });
      toast.success(`Joined ${res.data?.data?.teamName || "team"}`);
      navigate(`/teams/${res.data?.data?.teamId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid invite code");
    }
  };

  return (
    <AppShell
      setAuth={setAuth}
      title="Team details"
      actions={
        <Button size="sm" variant="secondary" onClick={() => navigate("/teams")}>
          Back to teams
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : !team ? (
        <Alert tone="error">Team not found</Alert>
      ) : (
        <div className="space-y-6 fade-up">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-[var(--color-ink)]">{team.name}</h2>
                <p className="mt-2 max-w-2xl text-[var(--color-soil)]/80">
                  {team.description || "No description provided."}
                </p>
              </div>
              {team.is_private ? (
                <FaLock className="text-[var(--color-soil)]/50" aria-label="Private" />
              ) : (
                <FaGlobe className="text-[var(--color-teal)]" aria-label="Public" />
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{team.category || "General"}</Badge>
              <Badge tone="leaf">{team.member_count} members</Badge>
              {team.my_role ? <Badge tone="clay">{team.my_role}</Badge> : null}
            </div>
            {canManage ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={createInvite}>
                  Generate invite code
                </Button>
                {inviteCode ? (
                  <code className="rounded-lg bg-[var(--color-mist)] px-3 py-2 text-sm">
                    {inviteCode}
                  </code>
                ) : null}
              </div>
            ) : null}
          </section>

          {!team.is_member ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl">Have an invite code?</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Input
                  id="join-code"
                  label="Invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <div className="flex items-end">
                  <Button onClick={joinWithCode}>Join with code</Button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-display text-2xl">Members</h3>
            <div className="mt-4 divide-y divide-[var(--color-ink)]/8">
              {(team.members || []).map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-[var(--color-soil)]/70">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={roleTone(member.role)}>{member.role}</Badge>
                    {canManage && member.role !== "owner" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMember(member.user_id)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
