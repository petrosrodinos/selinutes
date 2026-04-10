import { useMutation, useQuery } from "@tanstack/react-query";
import { signUp, signIn, refreshToken, updatePassword, updateUsername } from "../services/auth.services";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../store/authStore";

export const useSignUp = () => {
    return useMutation({
        mutationFn: signUp,
        onSuccess: () => {
            toast.success("Sign up successful");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}

export const useSignIn = () => {
    return useMutation({
        mutationFn: signIn,
        onSuccess: () => {
            toast.success("Sign in successful");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}

export const useRefreshToken = () => {
    return useQuery({
        queryKey: ['refresh-token'],
        queryFn: refreshToken,
    });
}

export const useUpdateUsername = () => {
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: updateUsername,
        onSuccess: (data) => {
            login(data);
            toast.success("Username updated successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: updatePassword,
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}