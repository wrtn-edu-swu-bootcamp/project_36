// Time Slot 상수
export const TimeSlot = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
  BEDTIME: 'BEDTIME',
} as const;

export type TimeSlot = (typeof TimeSlot)[keyof typeof TimeSlot];

// Sleep Inducing Level
export const SleepInducingLevel = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type SleepInducingLevel =
  (typeof SleepInducingLevel)[keyof typeof SleepInducingLevel];

// Alertness Effect Level
export const AlertnessLevel = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type AlertnessLevel = (typeof AlertnessLevel)[keyof typeof AlertnessLevel];

// Meal Timing
export const MealTiming = {
  BEFORE_MEAL: 'BEFORE_MEAL',
  AFTER_MEAL: 'AFTER_MEAL',
  WITH_MEAL: 'WITH_MEAL',
  ANYTIME: 'ANYTIME',
} as const;

export type MealTiming = (typeof MealTiming)[keyof typeof MealTiming];

// Interaction Severity
export const InteractionSeverity = {
  NONE: 'NONE',
  MILD: 'MILD',
  MODERATE: 'MODERATE',
  SEVERE: 'SEVERE',
} as const;

export type InteractionSeverity =
  (typeof InteractionSeverity)[keyof typeof InteractionSeverity];

// Medicine with recommendations
export interface MedicineWithRecommendation {
  id: string;
  name: string;
  recommendedTime: string;
  reason: string;
  timeSlot: TimeSlot;
}

// Life Pattern Form
export interface LifePatternForm {
  wakeUpTime: string;
  bedTime: string;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  workStartTime?: string;
  workEndTime?: string;
  hasDriving: boolean;
  hasFocusWork: boolean;
}

// Recommendation Request
export interface RecommendationRequest {
  medicineId: string;
  userId: string;
}

// Recommendation Response
export interface RecommendationResponse {
  recommendedTimes: string[];
  timeSlot: TimeSlot;
  reasons: string[];
  considerations: string[];
  personalizedInfo?: {
    wakeUpTime?: string;
    bedTime?: string;
    workingHours?: string;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search Result
export interface SearchResult {
  id: string;
  name: string;
  genericName?: string;
  company?: string;
  highlight?: string;
}
