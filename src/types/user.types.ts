export interface User {
  id: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
