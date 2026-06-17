export type UserGoal = 'muscle-gain' | 'weight-loss' | 'fitness';

export type SubscriptionPlan = {
  id: string;
  title: string;
  priceSarMonthly: number;
  description: string;
  features: string[];
};

export type WorkoutTask = {
  id: string;
  dayLabel: string;
  title: string;
  durationMin: number;
  intensity: 'low' | 'medium' | 'high';
  completed: boolean;
  videoUrl: string;
  coachName: string;
  coachId: string;
  thumbnail: string;
  exercises?: Exercise[];
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  muscleGroup: string;
  thumbnail: string;
  notes?: string;
};

export type MealItem = {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  calories: number;
  time: string;
  image: string;
  protein: number;
  carbs: number;
  fat: number;
};

export type InjuryReport = {
  id: string;
  area: string;
  severity: 1 | 2 | 3;
  status: 'new' | 'monitoring' | 'resolved';
  note: string;
};

export type ChatThread = {
  id: string;
  name: string;
  role: 'coach' | 'nutritionist' | 'physio' | 'team';
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  avatarColor: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderName: string;
  isMe: boolean;
  text: string;
  timeLabel: string;
  type: 'text' | 'image' | 'workout';
};

export type HealthSnapshot = {
  readinessPercent: number;
  sleepHours: number;
  steps: number;
  heartRate: number;
};

export type AdminConfig = {
  workoutPlanVersion: string;
  nutritionPlanVersion: string;
  challengesEnabled: boolean;
};

export type RunSession = {
  id: string;
  date: string;
  dateLabel: string;
  durationSec: number;
  distanceKm: number;
  avgPaceSecPerKm: number;
  calories: number;
  avgHeartRate: number;
  steps: number;
};

export type WeeklyProgressDay = {
  dayShort: string;
  steps: number;
  stepsGoal: number;
  workoutDone: boolean;
  caloriesBurned: number;
  runKm?: number;
};

export type BodyMeasurement = {
  date: string;
  weightKg: number;
  bodyFatPct: number;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string;
  weeklyPoints: number;
  streak: number;
  isMe?: boolean;
};

export type CoachVideo = {
  id: string;
  title: string;
  thumbnail: string;
  durationMin: number;
  category: string;
  viewsCount: number;
};

export type Professional = {
  id: string;
  name: string;
  role: 'coach' | 'nutritionist' | 'physio';
  specialization: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  yearsExp: number;
  clientsCount: number;
  pricePerMonth: number;
  avatarInitials: string;
  avatarColor: string;
  isSelected?: boolean;
  badge?: string;
  videos: CoachVideo[];
};

export type Community = {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'running' | 'nutrition' | 'wellness' | 'mixed';
  coachId: string;
  coachName: string;
  coachInitials: string;
  coachColor: string;
  membersCount: number;
  postsCount: number;
  isJoined: boolean;
  isFree: boolean;
  priceMonthly?: number;
  coverGradient: [string, string];
  latestPost: string;
  latestPostTime: string;
};

export type CommunityPost = {
  id: string;
  communityId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  isCoach: boolean;
  text: string;
  timeLabel: string;
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
  isLiked?: boolean;
};

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'program' | 'supplement' | 'equipment' | 'consultation';
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  coachName?: string;
  isFeatured?: boolean;
  durationWeeks?: number;
  tag?: string;
};

export type ScheduledSession = {
  id: string;
  time: string;
  title: string;
  type: 'workout' | 'meal' | 'recovery' | 'checkin' | 'coaching';
  durationMin: number;
  subtitle: string;
  isCompleted: boolean;
  workoutId?: string;
  color: string;
};

export type UserProfile = {
  name: string;
  email: string;
  goal: UserGoal;
  joinDate: string;
  avatarInitials: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  selectedCoachId: string;
  selectedNutritionistId: string;
  selectedPhysioId: string;
};
