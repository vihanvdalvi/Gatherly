import axios from 'axios';
import { getToken } from '../utils/localStorage';
import type {
  LoginPayload,
  SignupPayload,
  AuthResponse,
  Group,
  ScheduleSlot,
  AddScheduleSlot,
  BestMeetingResult,
} from '../types/index';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers if available
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/users/login', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<AuthResponse>('/users/signup', payload),
};

// ============ USER ENDPOINTS ============
export const userAPI = {
  listGroups: (userId: string) =>
    apiClient.get<Group[]>(`/users/${userId}/list-groups`),
};

// ============ GROUPS ENDPOINTS ============
export const groupAPI = {
  create: (name: string, creatorUserId: string) =>
    apiClient.post<Group>('/groups/create', null, { params: { group_name: name, creator_user_id: creatorUserId } }),

  join: (groupId: string, code: string, userId: string) =>
    apiClient.post<Group>(`/groups/${groupId}/join`, null, { params: { user_id: userId, group_code: code } }),

  displayInfo: (groupId: string) =>
    apiClient.get<Group>(`/groups/${groupId}/displayInfo`),

  changeCode: (groupId: string) =>
    apiClient.post(`/groups/${groupId}/change_code`, {}),

  removeMember: (groupId: string, creatorUserId: string, memberUserId: string) =>
    apiClient.delete(`/groups/${groupId}/remove_member`, {
      params: { creator_user_id: creatorUserId, member_user_id: memberUserId },
    }),
};

// ============ SCHEDULE ENDPOINTS ============
export const scheduleAPI = {
  getUserSchedule: (userId: string) =>
    apiClient.get<ScheduleSlot[]>(`/schedule/${userId}`),

  addTimeSlot: (userId: string, payload: AddScheduleSlot) =>
    apiClient.post<ScheduleSlot>(`/schedule/${userId}/addTimeSlot`, payload),

  deleteSlot: (availabilityId: string) =>
    apiClient.delete(`/schedule/${availabilityId}`),

  getLocationsList: () =>
    apiClient.get<{ locations: string[] }>('/graph/all_locations'),
};

// ============ ALGORITHM ENDPOINTS ============
export const algorithmAPI = {
  getBestMeetingTimes: (groupId: string, dayOfWeek: number, meetingDuration: number) =>
    apiClient.get<BestMeetingResult>(`/algorithm/group/${groupId}/best_meeting_times`, {
      params: { day_of_week: dayOfWeek, meeting_duration: meetingDuration },
    }),
};

// ============ GRAPH ENDPOINTS ============
export const graphAPI = {
  getGraph: () =>
    apiClient.get('/graph'),

  getPath: (location1: string, location2: string) =>
    apiClient.get('/graph/path', {
      params: { start: location1, end: location2 },
    }),
};

export default apiClient;
