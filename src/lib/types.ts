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

export interface PostAuthor {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedResult {
  items: Post[];
  pagination: Pagination;
}

export interface LikeUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
  isMe: boolean;
  followsMe: boolean;
}

export interface PostLikesResult {
  users: LikeUser[];
  pagination: Pagination;
}
