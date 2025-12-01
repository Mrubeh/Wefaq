
export enum Gender {
  MALE = 'رجل',
  FEMALE = 'امرأة'
}

export enum SubscriptionPlan {
  FREE = 'مجاني',
  WEEKLY = 'أسبوعي',
  MONTHLY = 'شهري'
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  bio: string;
  photoUrl: string;
  job: string;
  isOnline: boolean;
  subscription: SubscriptionPlan;
  joinedDate: string;
  religion: string;
  sect: string;
  maritalStatus: string;
  blockedUserIds: string[];
  subscriptionEndDate?: string;
  role: UserRole;
  zodiacSign?: string;
  mood?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  partnerId: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'MESSAGE' | 'SYSTEM' | 'ALERT';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  date: string;
  type: 'SUPPORT' | 'COMPLAINT';
}

export interface Pulse {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  timestamp: number;
}

export type ViewState = 'HOME' | 'BROWSE' | 'PROFILE' | 'MESSAGES' | 'SUBSCRIPTION' | 'LOGIN' | 'REGISTER' | 'SUPPORT' | 'ADMIN';