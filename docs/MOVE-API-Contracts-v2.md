# MOVE API Contracts v2 (REST)

Base URL: /api/v2
Auth: Bearer token (Firebase Auth)

## 1) Daily Check-in and AI Adjustments
### POST /readiness/check-in
Request:
{
  "date": "2026-04-12",
  "sleepScore": 2,
  "fatigueScore": 4,
  "stressScore": 4,
  "restingHr": 71,
  "painReports": [
    { "bodyArea": "shoulder", "painScore": 6, "note": "pain on overhead press" }
  ]
}

Response:
{
  "status": "accepted",
  "adjustmentTriggered": true,
  "adjustmentId": "adj_123",
  "messages": ["Training load reduced 30% due to low readiness."]
}

### GET /plans/today
Response:
{
  "planId": "plan_abc",
  "source": "ai_adjusted",
  "adjustmentReasons": ["sleep_low", "fatigue_high", "pain_shoulder"],
  "exercises": [
    { "name": "Incline DB Press", "sets": 2, "reps": 10, "intensity": "light", "replaced": true, "alternative": "Machine Chest Press" }
  ]
}

## 2) Workout Logging
### POST /sessions
- Create workout session

### POST /sessions/{sessionId}/exercise-logs
- Append set/log details

### POST /sessions/{sessionId}/complete
- Finalize session and compute adherence deltas

## 3) Team Connect
### GET /team/users/{userId}/dashboard
Response includes:
- metrics summary
- plan adherence
- readiness trend
- pain and rehab constraints
- open alerts
- latest specialist notes

### POST /team/users/{userId}/notes
Request:
{
  "noteType": "physio",
  "impactLevel": "action_required",
  "content": "No overhead pressing for 14 days."
}

### POST /team/users/{userId}/constraints
Request:
{
  "bodyArea": "shoulder",
  "restrictionLevel": "high",
  "forbiddenExercises": ["barbell_overhead_press"],
  "alternatives": ["landmine_press", "machine_press_neutral_grip"]
}

### GET /alerts?userId={id}&resolved=false
- List unresolved alerts by role visibility

### POST /alerts/{alertId}/resolve
Request:
{
  "resolutionNote": "Plan updated and patient informed"
}

## 4) Challenges and Leaderboard
### POST /challenges
Request:
{
  "name": "100k Steps April",
  "challengeType": "steps",
  "scope": "team",
  "startDate": "2026-04-15",
  "endDate": "2026-04-30",
  "targetValue": 100000
}

### POST /challenges/{challengeId}/join
- Join challenge as user or team

### POST /challenges/{challengeId}/progress
Request:
{
  "increment": 4200,
  "source": "device"
}

### GET /challenges/{challengeId}/leaderboard
Response:
{
  "period": "weekly",
  "rows": [
    { "rank": 1, "userId": "u1", "score": 28000 },
    { "rank": 2, "userId": "u2", "score": 26500 }
  ]
}

## 5) Admin and Audit
### GET /audit/events?entityType=plan&entityId={id}
- Return plan change history and actors

## 6) Error Contract
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "sleepScore must be between 1 and 5",
    "details": []
  }
}

## 7) Idempotency and Reliability
- Support Idempotency-Key on POST endpoints that can be retried
- Emit event bus messages after:
  - readiness check-in processed
  - plan auto-adjusted
  - critical alert created
  - challenge leaderboard refreshed
