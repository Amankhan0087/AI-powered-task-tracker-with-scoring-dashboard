export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}
