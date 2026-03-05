export interface Users {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface UserUpsertRequest {
  username: string;
  email: string;
  role: string;
  password?: string;
}
