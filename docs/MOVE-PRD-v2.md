# MOVE PRD v2 - Engine, Team Connect, and Daily Experience

## 1) Product Vision
MOVE is a daily fitness operating system, not only a workout tracker. It adapts plans dynamically, synchronizes coaches and specialists, and drives retention through social challenges.

## 2) Scope (V2)
- Dynamic AI Adjuster (auto training adaptation)
- Team Connect Shared Dashboard (coach, nutritionist, physio)
- MOVE Challenges + Leaderboard
- Daily UX loop for high adherence

Out of scope (V2):
- Full telemedicine workflows
- Insurance/provider integrations
- Marketplace for external coaches

## 3) Personas
- User (athlete/client)
- Coach (training plan owner)
- Nutritionist (nutrition owner)
- Physio/Doctor (injury and rehab owner)
- Admin (governance and moderation)

## 4) Core Journeys
### User Daily Journey (Primary)
1. Morning check-in (sleep, fatigue, pain, readiness)
2. App updates training intensity automatically
3. User sees "Today Plan" with clear confidence level
4. User logs session and effort (RPE)
5. End-of-day summary + streak + challenge progress

### Specialist Journey
1. Opens shared dashboard for assigned users
2. Reviews alerts and trend deltas
3. Adds recommendation or medical note
4. System notifies other team members if plan impact exists

## 5) Dynamic AI Adjuster (Rules + Intelligence)
### Inputs
- Sleep quality score (1-5)
- Fatigue score (1-5)
- Pain map by body area (0-10)
- Session RPE and completion rate
- Resting heart rate / HRV (optional)

### Decision Layers
1. Safety Layer (hard constraints)
- Pain >= 7 on body area => block high-load exercises affecting same area
- Multiple red flags in 48h => auto deload week suggestion

2. Load Layer
- Poor sleep + high fatigue => reduce volume 20-40%
- Strong readiness + positive trend => progressive overload +2.5% to +7.5%

3. Recovery Layer
- Insert mobility/recovery block when stress trend is high

### Outputs
- Updated session plan (sets/reps/intensity)
- Reason tags ("sleep_low", "pain_shoulder", "fatigue_high")
- Notification to user + coach with explainability text

## 6) Team Connect Shared Dashboard
### Shared Data Surface
- Body metrics and trends
- Workout adherence and performance
- Nutrition adherence
- Injury/pain status
- Recovery and readiness

### Collaboration Rules
- Every note/action has owner and timestamp
- Physio injury note triggers coach alert instantly
- Coach edits load, nutritionist gets informed if recovery calories need adjustment

### Permissions (RBAC)
- User: read own data, submit logs
- Coach: edit training plans, read assigned users
- Nutritionist: edit meal plans, read performance and body metrics
- Physio: write injury/rehab plans, set movement constraints
- Admin: full access + audit

## 7) Gamification and Social
- Challenge types: steps, sessions, distance, consistency streak
- Challenge modes: solo, team, invite-only
- Leaderboards: weekly and monthly
- Reward system: badges, milestone cards, streak multipliers
- Basic anti-cheat: anomaly checks for unrealistic steps/distance spikes

## 8) Success Metrics (KPIs)
- D1 check-in completion rate
- Weekly active days per user
- 4-week retention
- Plan adherence rate
- Injury-related session abort rate
- Team response time to medical/rehab alerts
- Challenge participation and completion rate

## 9) Non-Functional Requirements
- Explainable recommendations (no black-box only output)
- Near real-time alerts (<5 seconds target)
- Privacy and role-based access by default
- Arabic-first copy with clear English technical fallback

## 10) Release Plan
### Sprint 1
- Daily check-in + rules engine v1
- Auto deload and pain safety constraints

### Sprint 2
- Shared dashboard + RBAC + alert pipeline

### Sprint 3
- Challenges + leaderboard + retention loops

### Sprint 4
- Model refinement, experimentation, and personalization tuning

## 11) Risks and Mitigation
- False positive deloads -> add coach override with reason logging
- Alert fatigue -> severity levels and digest mode
- Data inconsistency across specialists -> canonical event log and conflict rules
