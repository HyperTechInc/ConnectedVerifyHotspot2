export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'banned' | 'timeout';
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';
export type CodeType = 'permanent' | 'email' | 'phone' | 'qr';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  timeoutUntil?: string;
  deviceType: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isPermanent: boolean;
  createdAt: string;
}

export interface HotspotCode {
  id: string;
  code: string;
  type: CodeType;
  isUsed: boolean;
  expiresAt?: string;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  createdAt: string;
  isModerated: boolean;
}

export interface AccessRequest {
  id: string;
  uid: string;
  username: string;
  code: string;
  status: AccessRequestStatus;
  hasDownloadedConfig: boolean;
  createdAt: string;
}

export interface GlobalSettings {
  autoApprove: boolean;
  wifiSSID?: string;
  wifiPassword?: string;
  wifiSecurity?: 'WPA' | 'WEP' | 'nopass';
}
