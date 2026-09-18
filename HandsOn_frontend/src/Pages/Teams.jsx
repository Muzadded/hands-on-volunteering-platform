import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaLock } from "react-icons/fa";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

export default function Teams({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/teams");
      setTeams(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      teams.filter((team) =>
        String(team.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [teams, search]
  );

  const join = async (teamId) => {
    setJoiningId(teamId);
    try {
      await api.post(`/teams/${teamId}/join`);
      toast.success("Joined team");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join team");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <AppShell
      setAuth={setAuth}
      title="Teams"
      actions={
        <Button size="sm" onClick={() => navigate("/create-team")}>
          Create team
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Input
          id="team-search"
          label="Search teams"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-end gap-2">
          <Input
            id="team-invite-code"
            label="Join with invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button
            onClick={async () => {
              try {
                const res = await api.post("/teams/join-by-code", {
                  code: inviteCode.trim(),
                });
                toast.success("Joined team");
                navigate(`/teams/${res.data?.data?.teamId}`);
              } catch (err) {
                toast.error(err.response?.data?.message || "Invalid code");
              }
            }}
          >
            Join
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No teams found"
          description="Create a team or try a different search."
          actionLabel="Create team"
          onAction={() => navigate("/create-team")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((team) => (
            <article key={team.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl">{team.name}</h3>
                {team.is_private ? (
                  <FaLock className="text-[var(--color-soil)]/50" aria-label="Private team" />
                ) : (
                  <FaGlobe className="text-[var(--color-teal)]" aria-label="Public team" />
                )}
              </div>
              <Badge className="mt-3">{team.category || "General"}</Badge>
              <p className="mt-3 line-clamp-3 text-sm text-[var(--color-soil)]/80">
                {team.description || "No description provided."}
              </p>
              <p className="mt-3 text-sm text-[var(--color-soil)]/70">
                {team.member_count || 0} members
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/teams/${team.id}`)}>
                  View
                </Button>
                {!team.is_member && !team.is_private ? (
                  <Button
                    size="sm"
                    loading={joiningId === team.id}
                    onClick={() => join(team.id)}
                  >
                    Join
                  </Button>
                ) : team.is_member ? (
                  <Badge tone="leaf">Member</Badge>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
