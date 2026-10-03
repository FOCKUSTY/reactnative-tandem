export interface User {
  id: string;
  username: string;
  name: string;
  email?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PairUser {
  id: string;
  username: string;
  name: string;
}

export interface MeResponse extends User {
  pairId: string | null;
  pair?: {
    userA: PairUser;
    userB: PairUser;
  };
  partner?: PairUser;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
