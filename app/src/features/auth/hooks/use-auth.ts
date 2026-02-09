import { useMutation, useQuery } from "@tanstack/react-query";
import { signUp, signIn, refreshToken } from "../services/auth.services";
import { toast } from "react-toastify";

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