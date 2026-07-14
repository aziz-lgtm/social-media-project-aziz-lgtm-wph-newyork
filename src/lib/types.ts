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
  /** The API returns null for posts created without a caption. */
  caption: string | null;
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

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: PostAuthor;
}

export interface CommentsResult {
  comments: Comment[];
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

export interface SearchUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

export interface SearchResult {
  users: SearchUser[];
  pagination: Pagination;
}

export interface PublicProfileCounts {
  post: number;
  followers: number;
  following: number;
  likes: number;
}

export interface PublicProfile {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  counts: PublicProfileCounts;
  isFollowing: boolean;
  isMe: boolean;
}

export interface UserPostsResult {
  posts: Post[];
  pagination: Pagination;
}
