# HandsOn — Future Updates Roadmap

**Status:** Priority 0 complete — ready for Priority 1  
**Builds on:** [`PRODUCTION_MODERNIZATION_PLAN.md`](../PRODUCTION_MODERNIZATION_PLAN.md) (Phases 0–4 complete)  
**Goal:** Move HandsOn from a portfolio demo to a platform real NGOs, volunteers, and communities can run day-to-day.

---

## 1. Why these updates

HandsOn already has a clean layered API, validation, transactional joins, tests, CI, and Docker. What it lacks is support for how volunteering actually runs in real life:

1. **Automated coordination** — shifts, reminders, check-in, waivers
2. **Trust** — verified organizations, verified hours, reviews, phone verification
3. **Fast mobilization in emergencies** — blood requests, disaster relief, nearby responders

Features below are grounded in what established platforms ship today (see [Section 14](#14-research-sources)).

### Effort legend

| Tag | Meaning |
|-----|---------|
| **S** | Small — a few days |
| **M** | Medium — 1–2 weeks |
| **L** | Large — 3+ weeks |

---

## 2. Priority 0 — Trust and correctness fixes (do first)

These gaps undermine the core "verified impact hours" promise.

- [x] **Stop organizer self-inflation (S).** `createEvent` auto-inserts the organizer into `join_event`, consuming a capacity slot and allowing them to mark themselves "attended". Keep organizers out of registrants and block self-attendance.
- [x] **Profile privacy (S).** `GET /users/:id` exposes email, DOB, gender, and event history to any logged-in user. Split into a public profile DTO and a private self-only DTO.
- [x] **Private team privacy (S).** `getTeam` returns members of private teams to non-members. Enforce membership for private team details.
- [x] **Stop account enumeration (S).** Login returns "User not found" vs "Invalid Password". Return one generic error.
- [x] **Real time handling (M).** Replace `date DATE` + `TIME WITHOUT TIME ZONE` with `starts_at` / `ends_at TIMESTAMPTZ`. Fixes timezones, overnight events (`hoursBetween` returns 0), and multi-day events.
- [x] **Hide past / full events (S).** `listEvents` returns everything with no pagination; `recommended` can suggest past or full events. Add upcoming filter, capacity filter, and pagination.
- [x] **Remove legacy routes (S).** Unmount `/auth`, `/api`, `/dashboard` now that the frontend uses `/api/v1`.
- [x] **Account recovery (M).** Email verification and password reset (neither exists today).

> Implemented 2026-09-25. Migrations: `1730000000003_event-timestamps`, `1730000000004_auth-recovery`. Mail transport currently logs to the API console; SMTP can be wired later.
---

## 3. Priority 1 — Organizations and event operations

### 3.1 Organizations and platform roles (M)

- [ ] `organizations` table: name, logo, description, contact, `verified_at`, `verified_by`
- [ ] Organization staff roles (`owner | coordinator`)
- [ ] Global `admin` role for moderation and org verification
- [ ] **Verified NGO badge**; only hours certified by a verified organization count as "verified"

**Why:** Real events are run by NGOs, schools, and clubs — not anonymous accounts. This also fixes hours fraud at the source.

### 3.2 Full event lifecycle (M)

- [ ] Organizer can edit and cancel events (registrants notified automatically)
- [ ] Volunteer can withdraw
- [ ] **Waitlist** with automatic promotion when a spot opens
- [ ] **Recurring events** (weekly shifts, e.g. "every Saturday food drive")

### 3.3 Shifts and roles within an event (M)

- [ ] `event_shifts (event_id, role_name, starts_at, ends_at, capacity)`
- [ ] Signup per shift; capacity and hours tracked per shift
- [ ] Live seat count ("2 of 3 driver spots left")

Example: *Food drive — 3 drivers 9:00–12:00, 10 sorters 12:00–16:00.*

### 3.4 Day-of check-in (M)

- [ ] Event QR code shown on the organizer's phone; volunteers scan to check in / out
- [ ] Kiosk mode for large events
- [ ] Optional geofence check (volunteer must be near the event location)
- [ ] Hours = actual checked-in time, not scheduled time

### 3.5 Requirements and digital waivers (M)

- [ ] Per-event requirements: minimum age, driving license, first-aid training, etc.
- [ ] Waiver text per event with e-signature and timestamp
- [ ] Volunteer uploads documents once and reuses them across events
- [ ] Guardian consent for volunteers under 18

### 3.6 Group and family signup (S)

- [ ] Register guests / children along with yourself
- [ ] Team-based signup ("register my club for 8 spots")

### 3.7 Calendar and sharing (S)

- [ ] "Add to Google Calendar" and `.ics` download
- [ ] Shareable event links with preview (WhatsApp / Facebook)

---

## 4. Priority 1 — Communication and background jobs

- [ ] **Job queue** (e.g. pg-boss on existing Postgres) for scheduled work
- [ ] **Email** notifications: confirmation, change, cancellation
- [ ] **SMS** via a local Bangladeshi SMS gateway (phone is more reliable than email locally)
- [ ] **Reminders** 24h and 2h before an event — the single biggest lever for reducing no-shows
- [ ] Automated thank-you messages after attendance
- [ ] Organizer bulk messaging with templates
- [ ] Replace 15s notification polling with Server-Sent Events or WebSockets
- [ ] Per-user notification preferences (email / SMS / in-app)

---

## 5. Priority 1 — Help Posts upgrade (neighbour help)

Modelled on Nextdoor Help Map and Donoro.

- [ ] **Two-way posts:** "Ask for help" *and* "Offer help" (e.g. "I'm going to the bazar — anyone need anything?")
- [ ] **Categories:** groceries, medicine, elderly check-in, ride, tutoring, evacuation, other
- [ ] Title, edit, delete for posts
- [ ] **Map view** of nearby requests
- [ ] **One-tap invite** of nearby matching volunteers; they confirm, then contact info and time are shared
- [ ] Hide exact address until a request is claimed
- [ ] **Ratings and reviews** after completion
- [ ] **Report user / report post** with an admin moderation queue
- [ ] Crisis content guidance (direct users to emergency services / hotlines)

---

## 6. Priority 1 — Blood donation module (Bangladesh focus)

Highest real-world demand locally. Reuses existing matching, notifications, and help-post workflow. Modelled on Donoro, BloodLine, and Bloodman.

- [ ] Profile fields: blood group, last donation date, available-to-donate toggle
- [ ] **Eligibility reminder** when the donor can donate again (~every 3–4 months)
- [ ] **Emergency blood request:** blood group, hospital, units, urgency, needed-by time
- [ ] Broadcast to nearby **compatible** donors via push / SMS
- [ ] Donor confirms → requester sees contact and time; request status updates live
- [ ] Verified donors, donation history, post-donation review
- [ ] Report invalid / unreachable donor
- [ ] Directory: hospitals, blood banks, ambulance services, partner organizations
- [ ] Blood compatibility chart and donation guidance

---

## 7. Priority 2 — Discovery and matching

- [ ] **Real location (M):** `lat` / `lng` on events, help posts, and users; radius filtering (PostGIS or Haversine); map with Leaflet + OpenStreetMap. Replaces the current "cause keyword in location text" heuristic.
- [ ] **Bangladesh location hierarchy (S):** division → district → upazila picker
- [ ] **Availability (S):** volunteers set free slots (weekends, weekday evenings) and max travel distance
- [ ] **Better recommendation score (M):** skills + causes + distance + availability + remaining spots
- [ ] **Search, filters, pagination (M):** Postgres full-text search on events, help posts, teams
- [ ] **Reverse matching (S):** organizer sees top matching volunteers and sends "Invite to join / apply"

---

## 8. Priority 2 — Disaster relief campaign mode

Modelled on FloodAid_Bd and the British Red Cross Dhaka emergency platform.

- [ ] Admin creates a **crisis campaign** (e.g. "Sylhet Flood 2026"); related requests, events, and teams group under it
- [ ] **Needs heat map:** areas that received aid / were promised aid / still need urgent help
- [ ] NGOs log **delivery plans** and mark them complete (reduces duplicate relief and missed areas)
- [ ] Admin **verification** of requests to fight misinformation and duplicates
- [ ] **Auto responder selection** by proximity, skills, and availability; track acceptance and arrival
- [ ] Rescue / urgent incident reporting with GPS and photo
- [ ] **Offline-capable PWA** for field workers in low-network areas
- [ ] Public agency / verified announcement feed during a crisis

---

## 9. Priority 2 — Skills-based and remote volunteering

Modelled on Catchafire.

- [ ] **Pro bono projects:** scoped deliverables, estimated hours (5–50), required skills, impact statement
- [ ] Project templates (website, social media plan, grant proposal, logo design, data cleanup)
- [ ] **Short application:** "Why are you qualified?" and "Why this cause?" (+ portfolio link)
- [ ] Optional interview step; **mutual "Start project"** confirmation = commitment
- [ ] **1-hour consultation call** option (advice without a full project)
- [ ] Project status tracking and deliverable submission
- [ ] Virtual / remote opportunity flag on events

---

## 10. Priority 2 — Recognition, engagement, and reporting

### Volunteers

- [ ] **Milestone badges** (10 / 50 / 100 hours, first blood donation, etc.)
- [ ] **Hours certificate PDF** — for university, job applications, court-mandated service
- [ ] Public volunteer profile with verified impact
- [ ] Personal goals ("10 hours per month") with progress

### Teams

- [ ] **Team challenges and leaderboards** (campaign-based)
- [ ] Team hours report export — for university clubs and company CSR

### Organizations

- [ ] Impact dashboard (volunteers, hours, events, retention, no-show rate)
- [ ] **Public impact page** ("42 volunteers, 1,200 hours, 300 families this year")
- [ ] CSV / PDF export for donors, boards, and grant reports
- [ ] Volunteer database with tags and notes

---

## 11. Priority 3 — AI integration (after data foundations)

Add AI once structured data (locations, shifts, attendance history) exists.

- [ ] **Auto-tagging (S):** LLM extracts tags, required skills, and category from event descriptions
- [ ] **Semantic matching (M):** embeddings for user bios/skills and event descriptions (pgvector), combined with distance and availability ("nurse" ↔ "first aid station")
- [ ] **Help / crisis triage (M):** classify category and urgency; flag spam, scams, and misinformation
- [ ] **Organizer assistant (S):** draft event descriptions, reminder messages, and post-event impact summaries
- [ ] **AI scheduling (M):** detect understaffed shifts and suggest best-fit volunteers to invite
- [ ] **No-show risk (M):** extra reminders for at-risk registrants; suggest overbooking based on historical no-show rate
- [ ] **Volunteer coach (M):** goal setting, reflection after events, and personalized suggestions (like Golden's "Goldie")
- [ ] **Natural-language search (M):** "something outdoors near me this Saturday morning" → structured filters

---

## 12. Priority 4 — Platform, security, and operations

- [ ] **Phone OTP verification**; limit features for unverified users
- [ ] Phone-number login option (common in Bangladesh)
- [ ] **Bangla / English** localization (i18n)
- [ ] Refresh tokens in httpOnly cookies (replace 1h JWT in localStorage)
- [ ] **Audit log** for attendance, hour, and role changes
- [ ] File storage for event photos, org logos, help images, and documents
- [ ] Error tracking (Sentry) and metrics
- [ ] Account deletion and personal data export
- [ ] Playwright end-to-end smoke tests
- [ ] Realistic large-volume seed data
- [ ] Mobile-first PWA (installable, push notifications)
- [ ] Optional later: donations via bKash / Nagad for relief campaigns

---

## 13. Suggested sequencing

| Stage | Scope | Rough effort |
|-------|-------|--------------|
| 1. Stabilize trust | Section 2 | ~1 week |
| 2. Make it operable | Sections 3.1–3.4, 4 | 3–4 weeks |
| 3. Local impact | Sections 5, 6 | 2–3 weeks |
| 4. Discovery | Section 7 | 2 weeks |
| 5. Expand use cases | Sections 8, 9, 10 | 4–6 weeks |
| 6. Differentiate with AI | Section 11 | 2–3 weeks |
| Ongoing | Section 12 | — |

### Top 3 picks

1. **Blood donation module** — highest local demand; reuses existing code
2. **Shifts + waitlist + QR check-in + SMS/email reminders** — turns HandsOn into a tool NGOs can actually run
3. **Verified organizations + hours certificates** — makes "verified impact hours" genuinely trustworthy

---

## 14. Research sources

| Platform | Type | Features referenced |
|----------|------|---------------------|
| [VolunteerHub](https://volunteerhub.com/platform) | Volunteer management | Scheduling, waitlists, QR / kiosk check-in, email & SMS reminders, recognition, reporting |
| [Galaxy Digital](https://www.galaxydigital.com/product-comparison) | Volunteer management | Qualification verification, waivers, self check-in app, impact landing pages |
| [Golden](https://goldenvolunteer.com/platform/) | Volunteer management + app | Live shift inventory, location-based hour tracking, reusable documents, group signup, calendar sync, AI coach |
| [Catchafire](https://help.catchafire.org/en/articles/8380963-what-is-catchafire-and-how-do-i-join) | Skills-based volunteering | Scoped pro bono projects, applications, 1-hour calls, invite-to-apply |
| [Benevity](https://benevity.com/products/volunteer) | Corporate volunteering | Skills/location matching, challenges, leaderboards, CSR reporting |
| [Nextdoor Help Map](https://blog.nextdoor.com/2024/01/11/2024-help-map-storm-crew) | Neighbour help | Offer/ask help, crisis coordination, verified identity |
| [Donoro](https://donoroapp.com/) | Blood donation (BD) | Blood requests, nearby verified donors, one-tap invites, reviews |
| [BloodLine](https://play.google.com/store/apps/details?id=com.sandhani.badhan.bloodbankbd&hl=en) | Blood donation (BD) | Map search, eligibility reminders, ambulance directory, Bangla/English |
| [Bloodman](https://bloodman.org/) | Blood & community care (BD) | 24/7 coordination, phone-based registration |
| [FloodAid_Bd](https://devpost.com/software/floodaid_bd) | Disaster relief (BD) | Aid heat map, NGO delivery tracking, admin verification |
| [British Red Cross Dhaka platform](https://www.kaz.com.bd/our-work/the-british-red-cross) | Emergency response (BD) | GPS incident reports, validated alerts, auto responder selection |
