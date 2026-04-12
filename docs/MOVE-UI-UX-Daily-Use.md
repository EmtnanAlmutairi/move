# MOVE UI/UX Daily Use Playbook

## 1) UX Goal
Make MOVE feel like a daily companion: fast check-in, clear next action, one-tap logging, and visible progress momentum.

## 2) Information Architecture (Mobile First)
Bottom tabs:
- Home
- Train
- Recovery
- Team
- Challenges

Global quick actions:
- + Log set
- + Check-in
- + Pain report

## 3) Home Screen (Daily Operating Screen)
Top card:
- "Today Readiness" score (color coded)
- "Plan status" (normal, adjusted, deload)
- One CTA: "Start Today Session"

Mid section:
- Streak days
- Weekly completion ring
- Challenge progress bar

Bottom section:
- Alerts feed (medical/team/training)
- Coach note preview

Design principles:
- 3-second clarity: user should know what to do immediately
- One primary CTA per screen
- Numbers + short interpretation text

## 4) Daily Check-in UX
Flow length target: <= 20 seconds
- Step 1: Sleep selector (1-5)
- Step 2: Fatigue selector (1-5)
- Step 3: Pain body map (optional)
- Step 4: Confirm

After submit:
- Show "What changed and why" card
- Example: "We reduced pressing volume 30% due to shoulder pain and poor sleep."

## 5) Training Screen UX
Before workout:
- Session summary (duration, target intensity)
- Auto-adjust badge if modified

During workout:
- Large log controls (sets/reps/weight)
- Rest timer and quick RPE buttons
- "Swap exercise" with safer alternatives

After workout:
- Session score
- Adherence status
- Recovery recommendation

## 6) Team Screen UX
- Shared timeline from all specialists
- Filter chips: Coach, Nutrition, Physio, Medical
- Alert cards with clear owner and required action
- "Acknowledge and update" workflow (not just read-only)

## 7) Challenges UX
- Explore active challenges by goal level (Beginner/Intermediate/Advanced)
- Join in one tap
- Leaderboard with around-me view (+/- 3 ranks)
- Team challenge chat prompt and milestone celebrations

## 8) Retention Loops
- Daily reminder windows based on user timezone and behavior
- End-of-day summary card
- Weekly "progress story" with before/after metrics and wins
- Gentle reactivation flow for missed streaks ("resume, do not reset")

## 9) Accessibility and Localization
- Arabic-first layout support (RTL)
- Minimum contrast AA
- Tap targets >= 44px
- Numeric display consistency (kg, km, min)

## 10) UI Tokens Direction
- Readiness colors: green/amber/red semantic only
- Motion: subtle progress animations under 300ms
- Card system with hierarchy:
  - Primary decision card
  - Secondary insight cards
  - Tertiary informational chips

## 11) MVP UI Delivery Checklist
- Home screen daily card live
- Check-in flow integrated to AI Adjuster endpoint
- Plan adjustment explanation card
- Team alerts visible with action states
- Challenge join/progress/leaderboard screens
