export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface Profile extends User {
  bio: string | null;
  createdAt: string;
}

export interface MeStats {
  posts: number;
  followers: number;
  following: number;
  likes: number;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface MeResult {
  profile: Profile;
  stats: MeStats;
}
