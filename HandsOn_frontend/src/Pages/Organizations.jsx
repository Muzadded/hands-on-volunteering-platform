import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

export default function Organizations({ setAuth }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact_email: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [allRes, mineRes] = await Promise.all([
        api.get("/organizations"),
        api.get("/organizations/mine"),
      ]);
      setOrgs(allRes.data?.data || []);
      setMine(mineRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/organizations", {
        ...form,
        contact_email: form.contact_email || null,
        website: form.website || null,
      });
      toast.success("Organization created");
      setForm({ name: "", description: "", contact_email: "", website: "" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Organizations">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={create} className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl">Create organization</h2>
          <Input
            id="org-name"
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            id="org-description"
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            id="org-email"
            type="email"
            label="Contact email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
          <Input
            id="org-website"
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <Button type="submit" loading={saving}>
            Create
          </Button>
        </form>

        <div className="space-y-6">
          {loading ? (
            <Spinner label="Loading organizations" />
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : (
            <>
              <section>
                <h2 className="mb-3 font-display text-2xl">My organizations</h2>
                {mine.length === 0 ? (
                  <EmptyState
                    title="None yet"
                    description="Create an organization to host verified events."
                  />
                ) : (
                  <div className="space-y-3">
                    {mine.map((org) => (
                      <article key={org.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold">{org.name}</h3>
                          {org.verified_at ? <Badge tone="leaf">Verified</Badge> : <Badge>Unverified</Badge>}
                        </div>
                        <p className="mt-2 text-sm text-[var(--color-soil)]/80">
                          {org.description || "No description"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-soil)]/60">Role: {org.my_role}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-3 font-display text-2xl">Directory</h2>
                <div className="space-y-3">
                  {orgs.map((org) => (
                    <article key={`all-${org.id}`} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{org.name}</h3>
                        {org.verified_at ? <Badge tone="leaf">Verified NGO</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-soil)]/80">
                        {org.event_count || 0} events · {org.member_count || 0} staff
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
