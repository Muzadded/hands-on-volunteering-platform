import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Spinner";
import Alert from "../components/ui/Alert";

export default function Dashboard({ setAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [impact, setImpact] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        navigate("/login");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [profileRes, recommendedRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get("/events/recommended"),
        ]);
        const extracted = profileRes.data?.data;
        const user = extracted?.user || {};
        const skills = Array.isArray(user.skills)
          ? user.skills
          : String(user.skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        const causes = Array.isArray(user.causes)
          ? user.causes
          : String(user.causes || "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);

        setUserData({
          id: user.user_id,
          name: user.name || "Volunteer",
          email: user.email || "",
          gender: user.gender || "—",
          dob: user.dob,
          skills,
          causes,
          about: user.about || "",
        });
        setJoinedEvents(extracted?.joinedEvents || []);
        setJoinedTeams(extracted?.joinedTeams || []);
        setImpact(extracted?.impact || null);
        setRecommended((recommendedRes.data?.data || []).slice(0, 3));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const metrics = [
    { label: "Hours volunteered", value: impact?.hoursVolunteered ?? 0 },
    { label: "Events attended", value: impact?.eventsAttended ?? 0 },
    { label: "Help contributions", value: impact?.helpContributions ?? 0 },
    { label: "Teams joined", value: impact?.teamsJoined ?? 0 },
  ];

  return (
    <AppShell
      setAuth={setAuth}
      title="Dashboard"
      actions={
        userData ? (
          <Link to={`/edit-profile/${id}`}>
            <Button size="sm" variant="secondary">
              Edit profile
            </Button>
          </Link>
        ) : null
      }
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 sm:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : (
        <div className="space-y-8 fade-up">
          <section className="surface-panel rounded-3xl p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">
              Welcome back
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {userData?.name}
            </h2>
            <p className="mt-2 text-[var(--color-soil)]/80">{userData?.email}</p>
            {userData?.about ? (
              <p className="mt-4 max-w-3xl text-[var(--color-soil)]">{userData.about}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {(userData?.skills || []).map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
              {(userData?.causes || []).map((cause) => (
                <Badge key={cause} tone="leaf">
                  {cause}
                </Badge>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-[var(--color-soil)]/70">{metric.label}</p>
                <p className="mt-2 font-display text-4xl text-[var(--color-teal-deep)]">
                  {metric.value}
                </p>
              </div>
            ))}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">Recommended for you</h3>
              <Link to="/events-feed" className="text-sm font-semibold text-[var(--color-teal-deep)]">
                See all events
              </Link>
            </div>
            {recommended.length === 0 ? (
              <EmptyState
                title="No matches yet"
                description="Add skills and causes on your profile to get personalized recommendations."
                actionLabel="Edit profile"
                onAction={() => navigate(`/edit-profile/${id}`)}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {recommended.map((event) => (
                  <article key={event.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge tone="leaf">Score {event.matchScore}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-soil)]/75">
                      {event.details}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate("/events-feed")}
                    >
                      View in events
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">Your events</h3>
              <Link to="/events-feed" className="text-sm font-semibold text-[var(--color-teal-deep)]">
                Browse events
              </Link>
            </div>
            {joinedEvents.length === 0 ? (
              <EmptyState
                title="No events yet"
                description="Join an opportunity to see it here."
                actionLabel="Find events"
                onAction={() => navigate("/events-feed")}
              />
            ) : (
              <div className="space-y-3 md:hidden">
                {joinedEvents.map((event) => (
                  <article key={event.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="mt-1 text-sm text-[var(--color-soil)]/80">
                      {formatDate(event.date)} · {event.attendance_status || "registered"}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {joinedEvents.length > 0 ? (
              <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--color-mist)] text-[var(--color-soil)]">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinedEvents.map((event) => (
                      <tr key={event.id} className="border-t border-[var(--color-ink)]/8">
                        <td className="px-4 py-3 font-medium">{event.title}</td>
                        <td className="px-4 py-3">{formatDate(event.date)}</td>
                        <td className="px-4 py-3 capitalize">
                          {event.attendance_status || "registered"}
                        </td>
                        <td className="px-4 py-3">{event.category || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">Your teams</h3>
              <Link to="/teams" className="text-sm font-semibold text-[var(--color-teal-deep)]">
                Browse teams
              </Link>
            </div>
            {joinedTeams.length === 0 ? (
              <EmptyState
                title="No teams yet"
                description="Join a team to collaborate on longer initiatives."
                actionLabel="Find teams"
                onAction={() => navigate("/teams")}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {joinedTeams.map((team) => (
                  <article key={team.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">
                          {team.name}
                          {team.is_private ? (
                            <FaLock className="ml-2 inline text-[var(--color-soil)]/50" />
                          ) : null}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--color-soil)]/75">
                          {team.category} · {team.role} · {team.member_count} members
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/teams/${team.id}`)}>
                        View
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
