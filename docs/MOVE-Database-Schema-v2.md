# MOVE Database Schema v2 (Firestore-oriented)

## 1) Collections Overview
- users/{userId}
- goals/{goalId}
- plans/{planId}
- sessions/{sessionId}
- exercise_logs/{logId}
- body_metrics/{metricId}
- readiness_logs/{readinessId}
- pain_reports/{painId}
- rehab_constraints/{constraintId}
- team_assignments/{assignmentId}
- specialist_notes/{noteId}
- alerts/{alertId}
- challenges/{challengeId}
- challenge_participants/{participantId}
- leaderboard_snapshots/{snapshotId}
- achievements/{achievementId}
- audit_events/{eventId}

## 2) Key Document Structures
### users/{userId}
- fullName: string
- email: string
- role: enum(user|coach|nutritionist|physio|admin)
- timezone: string
- locale: string
- createdAt: timestamp
- status: enum(active|inactive)

### goals/{goalId}
- userId: ref users
- category: string
- targetType: string
- targetValue: number
- startDate: timestamp
- endDate: timestamp
- status: enum(active|completed|paused)

### plans/{planId}
- userId: ref users
- ownerCoachId: ref users
- weekStart: timestamp
- status: enum(draft|active|completed)
- source: enum(manual|ai_adjusted)
- adjustmentReasons: string[]
- days: array<object>

### sessions/{sessionId}
- userId: ref users
- planId: ref plans
- category: string
- startedAt: timestamp
- endedAt: timestamp
- durationMin: number
- completionRate: number
- rpe: number
- calories: number

### exercise_logs/{logId}
- sessionId: ref sessions
- exerciseId: string
- bodyArea: string
- setIndex: number
- reps: number
- weightKg: number
- holdSeconds: number
- distanceKm: number
- pace: number

### readiness_logs/{readinessId}
- userId: ref users
- date: date
- sleepScore: number (1..5)
- fatigueScore: number (1..5)
- stressScore: number (1..5)
- restingHr: number?
- hrv: number?

### pain_reports/{painId}
- userId: ref users
- date: date
- bodyArea: string
- painScore: number (0..10)
- note: string
- reportedBy: ref users

### rehab_constraints/{constraintId}
- userId: ref users
- bodyArea: string
- restrictionLevel: enum(low|medium|high|blocked)
- forbiddenExercises: string[]
- alternatives: string[]
- createdBy: ref users
- active: boolean

### team_assignments/{assignmentId}
- userId: ref users
- coachId: ref users?
- nutritionistId: ref users?
- physioId: ref users?
- startAt: timestamp
- endAt: timestamp?

### specialist_notes/{noteId}
- userId: ref users
- authorId: ref users
- authorRole: string
- noteType: enum(training|nutrition|physio|medical)
- content: string
- impactLevel: enum(info|action_required|critical)
- createdAt: timestamp

### alerts/{alertId}
- userId: ref users
- sourceType: enum(pain|fatigue|sleep|adherence|manual)
- severity: enum(low|medium|high|critical)
- title: string
- message: string
- visibleToRoles: string[]
- resolved: boolean
- resolvedBy: ref users?
- createdAt: timestamp

### challenges/{challengeId}
- name: string
- challengeType: enum(steps|distance|sessions|streak)
- scope: enum(solo|team|public)
- startDate: date
- endDate: date
- targetValue: number
- createdBy: ref users
- status: enum(draft|active|completed)

### challenge_participants/{participantId}
- challengeId: ref challenges
- userId: ref users
- teamId: string?
- progressValue: number
- rank: number
- lastUpdated: timestamp

### leaderboard_snapshots/{snapshotId}
- challengeId: ref challenges
- period: enum(weekly|monthly)
- generatedAt: timestamp
- rows: array<object> (userId/teamId, score, rank)

### achievements/{achievementId}
- userId: ref users
- code: string
- title: string
- unlockedAt: timestamp
- metadata: object

### audit_events/{eventId}
- actorId: ref users
- actorRole: string
- action: string
- entityType: string
- entityId: string
- before: object?
- after: object?
- reason: string?
- createdAt: timestamp

## 3) Index Recommendations
- sessions: userId + startedAt desc
- readiness_logs: userId + date desc
- pain_reports: userId + date desc
- alerts: userId + resolved + createdAt desc
- specialist_notes: userId + createdAt desc
- challenge_participants: challengeId + progressValue desc

## 4) Data Integrity Rules
- One active team assignment per user window
- Only physio/doctor can create high-level rehab constraints
- Plan updates from AI must include adjustmentReasons
- Critical alerts require resolution audit entry
