// User-related types
export interface User {
  user_id: string;
  name: string;
  email: string;
  home_location: string;
}

// Group-related types
export interface Group {
  group_id: string;
  name: string;
  creator_id: string;
  is_creator: boolean;
  members: GroupMember[];
  code?: string;
}

export interface GroupMember {
  user_id: string;
  name: string;
  is_creator: boolean;
}

// Schedule-related types
export interface ScheduleSlot {
  availability_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  location: string;
  day_of_week?: string;
}

export interface AddScheduleSlot {
  start_time: string;
  end_time: string;
  location: string;
}

// Algorithm/Best Meeting Types
export interface FreeInterval {
  start_time: string;
  end_time: string;
  day_of_week: string;
  members_available: string[];
}

export interface BestMeetingResult {
  free_intervals: FreeInterval[];
  suggested_location: string;
  suggested_time?: {
    start_time: string;
    end_time: string;
    day_of_week: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  home_location: string;
}

export interface AuthResponse {
  user_id: string;
  name: string;
  email: string;
  home_location: string;
  token?: string;
}
