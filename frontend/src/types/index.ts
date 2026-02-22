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
  day_of_week: number;
  start_seconds: number;
  end_seconds: number;
  location: string;
  purpose?: string;
}
export interface AddScheduleSlot {
  day_of_week: number;
  start_seconds: number;
  end_seconds: number;
  location: string;
  purpose?: string;
}

// Algorithm/Best Meeting Types
export interface PathNode {
  location: string;
  lat: number;
  lon: number;
}

export interface UserLocationSlot {
  user_id: string;
  name: string;
  location: string;
  walk_time: number;
  path: PathNode[];
}

export interface CommonSlot {
  start_seconds: number;
  end_seconds: number;
  start_hhmm: string;
  end_hhmm: string;
  meeting_location: string;
  user_locations: UserLocationSlot[];
}

export interface BestMeetingResult {
  day_of_week: number;
  slots: CommonSlot[];
}

export interface FreeInterval {
  start_time: string;
  end_time: string;
  day_of_week: string;
  members_available: string[];
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
