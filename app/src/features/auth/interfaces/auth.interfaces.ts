import type { User } from "../../users/interfaces/users.interfaces";

export interface SignUp {
    username: string;
    email: string;
    password: string;
    date_of_birth: string;
}

export interface SignIn {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    expires_in: number;
    user: User;
}