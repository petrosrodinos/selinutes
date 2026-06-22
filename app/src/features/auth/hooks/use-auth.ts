import { useMutation, useQuery } from "@tanstack/react-query";
import { signUp, signIn, refreshToken, updatePassword, updateUsername, forgotPassword, resetPassword } from "../services/auth.services";
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

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            toast.success("Reset link sent. Check your inbox — and your spam folder if you don't see it.");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}